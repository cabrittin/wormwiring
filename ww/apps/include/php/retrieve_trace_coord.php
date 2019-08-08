<?php
include_once('./dbconnect.php');
include_once('dbaux.php');

$debug = 0;
$DISPLAY = 2;

if ($debug == 1) {
   $db = 'Emmons_N2U';
   $cell = 'ASHL';
} else {
  $db = $_GET["db"];
  $cell = $_GET["neuron"];
}
 

$_db = new DB();
$_db->connect($db);
$continIds = $_db->get_contin_ids($cell);
$nt = new NeuronTrace($_db->db,$continIds,$cell);
foreach ($nt->series as $s=>$_v){
	$val = $_db->get_display_trace($s);
	foreach ($val as $v){
		$nt->series[$s]->add_x($v['x1'],$v['x2']);
		$nt->series[$s]->add_y($v['y1'],$v['y2']);
		$nt->series[$s]->add_z($v['z1'],$v['z2']);
		$nt->series[$s]->add_cb($v['cellbody1']);
		$nt->add_object($v['idobject1'],$v['x1'],$v['y1'],$v['z1']);
		$nt->add_object($v['idobject2'],$v['x2'],$v['y2'],$v['z2']);
		if ($v['cellbody1'] == 1){
		   $nt->cellBody->add_x($v['x1'],$v['x2']);
		   $nt->cellBody->add_y($v['y1'],$v['y2']);
		   $nt->cellBody->add_z($v['z1'],$v['z2']);
		}
		if ($v['remarks1'] != ''){
		   $nt->add_remark($v['x1'],$v['y1'],$v['z1'],$s,$v['remarks1']);
		}
		if ($v['remarks2'] != ''){
		   $nt->add_remark($v['x2'],$v['y2'],$v['z2'],$s,$v['remarks2']);
		}
	}
}

$contins = "'".implode("','",$continIds)."'";
$cellIds = "'".implode("','",$_db->cell_objects($nt->continName))."'";
$syn1 = $_db->get_display_pre_synapses($cellIds,'electrical');
$syn2 = $_db->get_display_post_synapses($cellIds,'electrical');
$syn = array_merge($syn1,$syn2);
foreach($syn as $k => $v){
	     $_syn = $_db->get_synapse_stats($v['synid']);
	     $_loc = $_db->get_display_object_xyz($v['cell'],$contins);	     
	     $label = $_syn['post'];
	     if ($nt->continName == $_syn['post']){
	     	 $label = $_syn['pre'];
	     } 
	     if (!is_null($_loc['x']) and !is_null($_loc['y']) and !is_null($_loc['z'])){
	      	 $nt->gapJunction->add_synapse($_loc['x'],$_loc['y'],$_loc['z'],
						$_syn['sects'],$label,$_syn['sectNum1'],
						$_syn['sectNum2'],$_syn['synId'],$_syn['pre'],
						$_syn['post']);
	      }
}

$syn = $_db->get_display_pre_synapses($cellIds,'chemical');
foreach($syn as $k => $v){
	     $_syn = $_db->get_synapse_stats($v['synid']);
	     $_loc = $_db->get_display_object_xyz($v['cell'],$contins);
	     if (!is_null($_loc['x']) and !is_null($_loc['y']) and !is_null($_loc['z'])){
	      	 $nt->preSynapse->add_synapse($_loc['x'],$_loc['y'],$_loc['z'],
						$_syn['sects'],$_syn['post'],$_syn['sectNum1'],
					   	$_syn['sectNum2'],$_syn['synId'],$_syn['pre'],
						$_syn['post']);
	      }
}

$syn = $_db->get_display_post_synapses($cellIds,'chemical');
foreach($syn as $k => $v){
	      $_syn = $_db->get_synapse_stats($v['synid']);
	      $_loc = $_db->get_display_object_xyz($v['cell'],$contins);
	      if (!is_null($_loc['x']) and !is_null($_loc['y']) and !is_null($_loc['z'])){
	      	 $nt->postSynapse->add_synapse($_loc['x'],$_loc['y'],$_loc['z'],
						$_syn['sects'],$_syn['pre'],$_syn['sectNum1'],
					   	$_syn['sectNum2'],$_syn['synId'],$_syn['pre'],
						$_syn['post']);
	      }
}


$data = $_db->get_display_params();
$nt->load_map_params($data);

$data = $nt->compile_data();
if ($debug==0) echo json_encode($data);
if ($debug==1) print_r($data);
?>
