<?php
include('dbaux.php');
include('common.php');

$debug = 0;

if ( $debug == 1){
   $sex = 'herm';
   $db = 'N2U';
} else {
  $sex = $_GET["sex"];
  $db = $_GET["db"];
};

$wafile = './configs/celegans/wa_link.txt';

if ($db == 'N2W'){
   $neuron_list = './ww/configs/celegans/pharynx_neurons.txt';
   $muscle_list = './ww/configs/celegans/pharynx_muscle.txt';
} else {
  if ($sex == 'herm'){
    $neuron_list = '../../../configs/celegans/full_herm_neurons.txt';
    $muscle_list = '../../../configs/celegans/full_herm_muscles.txt';     
  } elseif ($sex == 'male'){
    $neuron_list = './ww/configs/celegans/full_male_neurons.txt';
    $muscle_list = './ww/configs/celegansfull_male_muscle.txt';      
  };  
}


$neurons = file($neuron_list,FILE_IGNORE_NEW_LINES);
$muscles = file($muscle_list,FILE_IGNORE_NEW_LINES);
$contins = get_contin_names($db);

if ($debug == 1) print_r($contins);

foreach ($contins as $i => $c){
	$c = str_replace(array('[',']'),'',$c);
	$contins[$i] = $c;
};

$neurons = array_intersect($neurons,$contins);
$muscles = array_intersect($muscles,$contins);

$walinks = get_csv($wafile);

if ($debug == 1) print_r($walinks);

$_neurons = array();
$_muscles = array();
foreach ($neurons as &$value){
	$link = 0;
	if (array_key_exists($value,$walinks)){
	   $n = $walinks[$value];
	   $link = 'http://www.wormatlas.org/neurons/Individual%20Neurons/'.$n.'mainframe.htm';
	};
	$_tmp = explode('.',$value);
	$_val = $_tmp[0];
	$_neurons[$_val] = array(
			  'value' => $value,
	       	 	   'visible' => 0,
			   'plotted' => 0,
	       		   'walink' => $link
			   );
};

foreach ($muscles as &$value){
 	$_muscles[$value] = array(
			  'value' => $value,
	       		  'visible' => 0,
			  'plotted' => 0
	       		  );
};	       


$cells = array( 
       'Neurons' => $_neurons,
       'Muscles' => $_muscles 
       );      
if ($debug == 1) print_r($cells);
if ($debug == 0) echo json_encode($cells);
?>
