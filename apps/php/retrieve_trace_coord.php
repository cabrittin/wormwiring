<?php
include_once('./dbconnect.php');
include_once('dbaux.php');

$TEST = False;
$DISPLAY = 2;

if ($TEST) {
   $db = 'n2y';
   $cell = 'R4BL';
} else {
  $db = $_GET["db"];
  $cell = $_GET["neuron"];
}


$_db = new DB();
$_db->connect($db);
$nt = new NeuronTrace($_db,$cell);
foreach ($nt->series as $s => $_v){
	if ($DISPLAY == 2){   
	  $sql = $nt->display2_sql($s);
	} elseif ($DISPLAY == 3){
	  $sql = $nt->display3_sql($s);
	}
	$val = $_db->_return_query_rows_assoc($sql);
	foreach ($val as $v){
		$nt->series[$s]->add_x($v['x1'],$v['x2']);
		$nt->series[$s]->add_y($v['y1'],$v['y2']);
		$z1 = $_db->get_object_section_number($v['objName1']);
		$z2 = $_db->get_object_section_number($v['objName2']);
		$nt->series[$s]->add_z($z1,$z2);
		$nt->series[$s]->add_cb($v['cellbody']);
		$nt->add_object($v['objName1'],$v['x1'],$v['y1'],$z1);
		$nt->add_object($v['objName2'],$v['x2'],$v['y2'],$z2);
		if ($v['cellbody'] == 1){
		   $nt->cellBody->add_x($v['x1'],$v['x2']);
		   $nt->cellBody->add_y($v['y1'],$v['y2']);
		   $nt->cellBody->add_z($z1,$z2);
		}
		if ($v['remarks1'] != ''){
		   $nt->add_remark($v['x1'],$v['y1'],$z1,$s,$v['remarks1']);
		}
		if ($v['remarks2'] != ''){
		   $nt->add_remark($v['x2'],$v['y2'],$z2,$s,$v['remarks2']);
		}
	}
}


$data = $_db->get_gap_junction_synapses($nt->continName);
foreach($data as $d){
	      $label = $d[1];
	      if ($nt->continName == $d[1]){
	      	 $label = $d[0];
	      }
	      $c = $d[3];
	      $dict = $_db->get_synapse_cell_object_dict($c);
	      //$xyz = $_db->get_object_xyz($dict[$nt->continName]);
	      $xyz = $nt->get_object_xyz($dict[$nt->continName]);
	      $zrange = $_db->get_synapse_section_range($c);
	      if (!is_null($xyz['x']) and !is_null($xyz['y']) and !is_null($xyz['z'])){
	      	 $nt->gapJunction->add_synapse($xyz['x'],$xyz['y'],$xyz['z'],
						$d[2],$label,$zrange['sectionNum1'],
						$zrange['sectionNum2'],$c,$d[0],$d[1]);
	      }
}


$data = $_db->get_pre_chemical_synapses($nt->continName);
foreach($data as $d){
	      $c = $d[3];
	      $dict = $_db->get_synapse_cell_object_dict($c);
	      //$xyz = $_db->get_object_xyz($dict[$nt->continName]);
	      $xyz = $nt->get_object_xyz($dict[$nt->continName]);
	      $zrange = $_db->get_synapse_section_range($c);
	      if (!is_null($xyz['x']) and !is_null($xyz['y']) and !is_null($xyz['z'])){
	      	 $nt->preSynapse->add_synapse($xyz['x'],$xyz['y'],$xyz['z'],
						$d[2],$d[1],$zrange['sectionNum1'],
					   	$zrange['sectionNum2'],$c,$d[0],$d[1]);
	      }
}

$data = $_db->get_post_chemical_synapses($nt->continName);
foreach($data as $d){
	      $c = $d[3];
	      $dict = $_db->get_synapse_cell_object_dict($c);
	      //$xyz = $_db->get_object_xyz($dict[$nt->continName]);
	      $xyz = $nt->get_object_xyz($dict[$nt->continName]);
	      $zrange = $_db->get_synapse_section_range($c);
	      if (!is_null($xyz['x']) and !is_null($xyz['y']) and !is_null($xyz['z'])){
	      	 $nt->postSynapse->add_synapse($xyz['x'],$xyz['y'],$xyz['z'],
						$d[2],$d[0],$zrange['sectionNum1'],
					   	$zrange['sectionNum2'],$c,$d[0],$d[1]);
	      }
}

if ($DISPLAY == 2){   
  $nt->load_map2_params($_db);   
} elseif ($DISPLAY == 3){
  $nt->load_map3_params($_db);  
}

$data = $nt->compile_data();
echo json_encode($data);

?>
