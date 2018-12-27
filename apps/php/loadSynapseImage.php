<?php
ini_set('memory_limit',"10240M");
require_once('./dbconnect.php');
require_once('./dbaux.php');
include('./images.php');

//Parameters
$_iWidth = 600;
$_iHeight = 600;
$RELPATH = "../../image_data/";

$debug = 0;
$zoom = 0;

if ( $debug == 1){
   $db = 'N2U';
   $contin = 8929;
   $objNum = 73096;
} else {
  $db = $_GET["db"];
  $contin = $_GET["contin"];
  $objNum = $_GET["objNum"];
  $zoom = $_GET["zoom"];
};

$cellsyn = get_syncell($db,$contin,$objNum);
$_db = new DB();
$_db->connect($db);

//Get cell and synapse locations
$syn_loc = $_db->get_object_xy($objNum);
$cells = $_db->get_synapse_cell_objects($contin);
$iWidth = $_iWidth;
$iHeight = $_iHeight;

if (debug == 1) print_r($cells);

foreach ($cells as $cell){
	$cell_loc = $_db->get_object_xy($objNum);
      	$dx = abs($syn_loc['x'] - $cell_loc['x'])+750;
       	$dy = abs($syn_loc['y'] - $cell_loc['y'])+750;			
	$iWidth = max($iWidth,$dx);
      	$iHeight = max($iHeight,$dy);
};
$x0 = $syn_loc['x'] - $iWidth/2;
$y0 = $syn_loc['y'] - $iHeight/2;

//Create image file name
$tmp = $_db->get_image_data($contin);
$image = $tmp[$objNum];		 	 
$jpg = substr_replace($image['file'],'jpg',strrpos($image['file'],'.')+1);
$imgFile = $RELPATH.$db."/".$image['series']."/".$jpg;	

$_db->con->close();

$IMG = new Image($imgFile);
$IMG->set_dimensions($iWidth,$iHeight);
$IMG->set_center($x0,$y0);
$IMG->load();

if ($zoom == 0){
   $IMG->rect();
} else {
  $IMG->crop($cellsyn);
};

$data = $IMG->encode();
$IMG->clear();

if ($debug == 0) echo json_encode($data);
