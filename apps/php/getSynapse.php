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


if ( $debug == 1){
   $db = 'N2U';
   $contin = 549;
} else {
  $db = $_GET["db"];
  $contin = $_GET["contin"];
};


$_db = new DB();
$_db->connect($db);
$img = $_db->get_image_data($contin);
$syn = $_db->get_synapse_pre_post($contin);


foreach ($img as $objNum => $_img){
	$cellsyn = get_syncell($db,$contin,$_img['objNum']);	

	//Get cell and synapse locations
	$syn_loc = $_db->get_object_xy($_img['objNum']);
	$cells = $_db->get_synapse_cell_objects($contin);
	$iWidth = $_iWidth;
	$iHeight = $_iHeight;
	foreach ($cells as $cell){
		$cell_loc = $_db->get_object_xy($_img['objNum']);
	      	$dx = abs($syn_loc['x'] - $cell_loc['x'])+750;
	       	$dy = abs($syn_loc['y'] - $cell_loc['y'])+750;			
		$iWidth = max($iWidth,$dx);
	      	$iHeight = max($iHeight,$dy);
	};
	$x0 = $syn_loc['x'] - $iWidth/2;
	$y0 = $syn_loc['y'] - $iHeight/2;

	//Create image file name		 	 
	$jpg = substr_replace($_img['file'],'jpg',strrpos($_img['file'],'.')+1);
	$imgFile = $RELPATH.$db."/".$_img['series']."/".$jpg;	
	$img[$objNum]['jpg'] = $imgFile;
	
	/*
	//Load into Image
	$IMG = new Image($imgFile);
	$IMG->set_dimensions($iWidth,$iHeight);
	$IMG->set_center($x0,$y0);
	$IMG->load();
	
	//Encode reduced EM
	$IMG->rect();
	$img[$objNum]['reducedImg'] = $IMG->encode();  
	$IMG->clear();
	
	//Encode synapse located EM
	//$IMG->crop($cellsyn);
	//$_img['synLocImg'] = $IMG->encode();
	//$IMG->clear();
	*/
};


$_db->con->close();

$data = array(
	'db'=>$db,
	'contin'=>$contin,
	'pre'=>$syn['pre'],
	'post'=>$syn['post'],
	'sections'=>$syn['sections'],
	'image'=>$img
	);	




if ($debug == 0) echo json_encode($data);		
?>