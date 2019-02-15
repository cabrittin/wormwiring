<?php
ini_set('memory_limit',"2048M");
require_once('./dbconnect.php');
require_once('./dbaux.php');
include('./images.php');

//Parameters
$_iWidth = 600;
$_iHeight = 600;
$shiftX = 750;
$shiftY = 750;
$RELPATH = "./ww/data/image_data/";
$RELPATH="../../../data/image_data/";
$debug = 0;
$zoom = 0;

if ( $debug > 0){
   $db = 'Emmons_N2U';
   $contin = 3859;
   $objNum = 60861;
   $RELPATH="../../../data/image_data/";
   $zoom = 0;
} else {
  $db = $_GET["db"];
  $contin = $_GET["contin"];
  $objNum = $_GET["objNum"];
  $zoom = $_GET["zoom"];
};

$img = get_synapse_image($db,$contin,$objNum);

$iWidth = $_iWidth;
$iHeight = $_iHeight;
foreach ($img['post'] as $k => $v){
	$dx = abs($img['loc']['x'] - $v['x'] + $shiftX);
	$dy = abs($img['loc']['y'] - $v['y'] + $shiftY);
	$iWidth = max($iWidth,$dx);
      	$iHeight = max($iHeight,$dy);	
};

$dx = abs($img['loc']['x'] - $img['pre']['x'] + $shiftX);
$dy = abs($img['loc']['y'] - $img['pre']['y'] + $shiftY);
$iWidth = max($iWidth,$dx);
$iHeight = max($iHeight,$dy);

$imgFile = $RELPATH.$db."/".$img['series']."/".$img['image'].'.jpg';
$x0 = $img['loc']['x'] - $iWidth/2;
$y0 = $img['loc']['y'] - $iHeight/2;

$IMG = new Image($imgFile);
$IMG->set_dimensions($iWidth,$iHeight);
$IMG->set_center($x0,$y0);
$IMG->load();

if ($zoom == 0){
   $IMG->rect();
} else {
  $IMG->crop($img);
};


$data = $IMG->encode();
$IMG->clear();

if ($debug == 0) echo json_encode($data);
if ($debug == 1) echo json_encode($img);
if ($debug == 2) echo json_encode($data);
