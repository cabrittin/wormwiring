<?php
include('./dbaux.php');

$debug =0;

if ( $debug == 1){
   $series = 'Emmons_N2Y';
   $continName = 'R2BR';
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


if ($debug == 0) echo json_encode($data);
if ($debug == 1) print_r($data);