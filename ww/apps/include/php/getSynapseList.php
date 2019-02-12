<?php
include('./dbaux.php');

$debug = 0;

if ( $debug == 1){
   $series = 'Emmons_N2U';
   $continName = 'ASHL';
} else {
  $series = $_GET["series"];
  $continName = $_GET["continName"];
};

$continName = str_ireplace('sleep','',$continName);
$series = str_ireplace('sleep','',$series);

$data = array(
      'elec' => get_synapse_list($series,$continName,'elec'),
      'pre' => get_synapse_list($series,$continName,'pre'),
      'post' => get_synapse_list($series,$continName,'post')
);


if ($debug == 0) echo json_encode($data);
if ($debug == 1) print_r($data['elec']);