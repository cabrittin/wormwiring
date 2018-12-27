<?php
include('./dbaux.php');

$debug = 0;

if ( $debug == 1){
   $series = 'JSE';
   $continName = 'AVAL';
} else {
  $series = $_GET["series"];
  $continName = $_GET["continName"];
};

$continName = str_ireplace('sleep','',$continName);
$series = str_ireplace('sleep','',$series);

$elec = get_gap_junction_synapses($series,$continName);
$pre =  get_pre_chemical_synapses($series,$continName);
$post = get_post_chemical_synapses($series,$continName);


$data = array(
      'elec' => $elec,
      'pre' => $pre,
      'post' => $post
);

if ($debug == 0) echo json_encode($data);