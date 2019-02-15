<?php
require_once('./dbconnect.php');
require_once('./dbaux.php');

//Parameters
$_iWidth = 600;
$_iHeight = 600;
$shift_x = 750;
$shift_y = 750;
$RELPATH = "./ww/data/image_data/";

$debug = 0;

if ( $debug == 1){
   $db = 'Emmons_N2U';
   $contin = 3859;
} else {
  $db = $_GET["db"];
  $contin = $_GET["contin"];
};


$_db = new DB();
$_db->connect($db);

$syn = $_db->get_synapse($contin);
$img = $_db->get_synapse_image($contin);

$_db->con->close();

$data = array(
      	'synapse'=>$syn,
        'image'=>$img
      );    

if ($debug == 0) echo json_encode($data);		
if ($debug == 1){
   print_r($syn);
   print_r($img);
}
?>
