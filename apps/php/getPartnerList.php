<?php
include('./dbaux.php');

$debug = 0;

if ( $debug == 1){
   $series = 'N2U';
   $continName = 'ASHL';
} else {
  $series = $_GET["series"];
  $continName = $_GET["continName"];
};

$continName = str_ireplace('sleep','',$continName);
$series = str_ireplace('sleep','',$series);

$data = array(
      'headers' => $series,
      'elec' => get_partner_lists($series,$continName,'elec'),
      'pre' => get_partner_lists($series,$continName,'pre'),
      'post' => get_partner_lists($series,$continName,'post')
);


//print_r($data);
if ($debug == 0) echo json_encode($data);