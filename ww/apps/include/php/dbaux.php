<?php
if (file_exists('./dbconnect.php')){
   require_once('./dbconnect.php');
}else{
   require_once('./php/dbconnect.php');
}

if (file_exists('./synObj.php')){
   include('./synObj.php');
}else{
   include('./php/synObj.php');
}

function get_dbs($series,$cell,$full=False){
	  if ($series == 'herm'){
	       return herm_dbs($cell,$full);	 
	        } elseif ($series == 'male'){
		     return male_dbs($cell,$full);
         } elseif ($series == 'pharynx'){
	      return pharynx_dbs($cell);
	       } else {
	            return 0;
		     }
}

function herm_dbs($cell,$full=False){
	  $dbs = array();
	  $_db = new DB();
	  $_db->connect('N2U');
	  if ($_db->has_cell($cell)){
	     $dbs[] = array("N2U","Adult head (N2U)");
	  }
          $_db->select_db('JSE');
	  if ($_db->has_cell($cell)){
             $dbs[] = array("JSE","Adult tail (JSE)");
	  }
          if ($full){
	     $_db->select_db('fullanimal');
             if ($_db->has_cell($cell)){
		 $dbs[] = array("fullanimal","Fullanimal");
             }
	  }
          $_db->con->close();
	  return $dbs;
}

function male_dbs($cell,$full=False){
	  $dbs = array();
	  $_db = new DB();
	  $_db->connect('n2y');
	  if ($_db->has_cell($cell)){
	     $dbs[] = array("n2y","Adult tail (N2Y)");
          }
          $_db->select_db('n930');
          if ($_db->has_cell($cell)){
             $dbs[] = array("n930","Adult head (N930)");
          } 
          if ($full){
	     $_db->select_db('fullanimal_male');
	     if ($_db->has_cell($cell)){
	        $dbs[] = array("fullanimal_male","Fullanimal");
             }
          }
          $_db->con->close();
          return $dbs;
}

function pharynx_dbs($cell){
	  $dbs = array();
	  $_db = new DB();
	  $_db->connect('N2W');
	  if ($_db->has_cell($cell)){
	      $dbs[] = array("N2W","Adult pharynx (N2W)");
	  }
   	  $_db->con->close();
          return $dbs;
}

function get_contin_names($db){
	 $_db = new DB();
	 $_db->connect($db);
	 $contins = $_db->get_contin_names();
	 return $contins;
}

	

function get_partner_lists($db,$cell,$ptype)
{
	$_db = new DB();
	$_db->connect($db);
	$idx_1 = 1;
	$idx_2 = 2;
	$cellIds = "'".implode("','",$_db->cell_objects($cell))."'";
	if ($ptype == "elec"){
	  $partners = $_db->get_gap_junction_partners($cellIds);
	  $idx_1 = 2;
	  $idx_2 = 3;		  
	} elseif ($ptype == "pre") {
	  $partners = $_db->get_pre_chemical_partners($cellIds);
	} elseif ($ptype == "post") {
	  $partners = $_db->get_post_chemical_partners($cellIds);
        };

	$results = array();
	foreach ($partners as $row){
	  $partner = $row[0];
	  if ($row[0] == $cell){
	     $partner = $row[1];
	  }
	  $results[] = array($partner,$row[$idx_1],$row[$idx_2]);
	}	
	
	$_db->con->close(); return $results; } 


function get_synapse_list($db,$cell,$ptype)
{
	$_db = new DB();
	$_db->connect($db);
	$cellIds = "'".implode("','",$_db->cell_objects($cell))."'";
	if ($ptype == "elec"){
		$synIds = "'".implode("','",$_db->get_gap_junction_idcontins($cellIds))."'";	
		$syn = $_db->get_synapse_batch($synIds);
		$partners = format_synapse($syn,"|-|");
	} elseif ($ptype == "pre") {
		$synIds = "'".implode("','",$_db->get_pre_chemical_idcontins($cellIds))."'";	
		$syn = $_db->get_synapse_batch($synIds);
		$partners = format_synapse($syn,"->");
	} elseif ($ptype == "post") {
		$synIds = "'".implode("','",$_db->get_post_chemical_idcontins($cellIds))."'";	
		$syn = $_db->get_synapse_batch($synIds);
		$partners = format_synapse($syn,"->");
	};

	$_db->con->close();
	return $partners;
}


function format_synapse($syn,$symbol){
	$partners = array();
	foreach ($syn as $v){
		$tmp = array($v['pre'].$symbol.$v['post'],
			$v['synId'],$v['sectNum1'],$v['sects']);
		$partners[] = $tmp;
	}
	return $partners;
}

function _get_dbs($series){
	if ($series == 'herm'){
	    $dbs = array("N2U","JSE");
	} elseif ($series == 'male'){
	       $dbs = array("n2y","n930");
	} elseif ($series == 'pharynx'){
	       $dbs = array("N2W"); 
	} else {
	   echo "Series error!";
        }
	return $dbs;
}


function get_image($db,$contin){
	 $_db = new DB();
	 $_db->connect($db);
	 $data = $_db->get_image_data($contin);
	 $_db->con->close();
	 return $data;
}



function get_synapse_image($db,$continNum,$synObject){
      $_db = new DB();
      $_db->connect($db);
      
      $syntype = $_db->get_synapse_type($continNum);
      $synXY = $_db->get_synapse_xy($synObject);
      $synPre = $_db->get_synapse_pre_xy($synObject);
      $synPost = $_db->get_synapse_post_xy($synObject);
      $img = $_db->get_object_image($synObject);

      $_db->con->close();

      $data = array(
      	    'type'=>$syntype,
	    'loc'=>$synXY,
	    'pre'=>$synPre,
	    'post'=>$synPost,
	    'series'=>$img['series'],
	    'image'=>$img['imagename']
      );
      return $data;
      
}



class CellSyn {
      
      function __construct($contin){
      	              $this->contin = $contin;	       
      }

      function get_contin(){
      	              return $this->contin;
      }

      function add_object($obj){
      	     $this->object = $obj;
      }
      
      function get_object(){
      	     return $this->object;
      }
      
      function add_x($x){
      	     $this->x = $x;
      }
      
      function get_x(){
      	     return $this->x;
      }      

      function add_y($y){
      	      $this->y = $y;
      }
      
      function get_y(){
      	      return $this->y;
      }

      function add_name($name){
      	      $this->name = $name;
      }
      
      function get_name(){
      	      return $this->name;
      }

      function add_type($type){
      	      $this->type = $type;
      }
      
      function get_type(){
      	      return $this->type;
      }      

}     


class NeuronTrace {
      
      function __construct($db,$continIds,$continName){
      	       $this->db = $db;
	       $this->continName = $continName;
	       $this->continNums = $continIds;
	       foreach ($this->continNums as $c){
	       	 $this->series[$c] = new TraceLocation();
	       }
	       $this->cellBody = new TraceLocation();
	       $this->preSynapse = new TraceSynapse();
	       $this->postSynapse = new TraceSynapse();
	       $this->gapJunction = new TraceSynapse();
	       $this->remarks = array();
	       $this->plotParam = array();
	       $this->objects = array();       	       
      } 

      function add_object($obj,$x,$y,$z){
      	       $this->objects[$obj] = array( 
	       			      	     'x' => $x,
					     'y' => $y,
					     'z' => $z
					     );	       
      }
      
      
      function get_object_xyz($obj){
      	       return $this->objects[$obj];
      
      }




     function add_remark($x,$y,$z,$series,$remark){
     	      $this->remarks[] = array(-$x,$y,$z,$series,$remark);
     }

     function load_map_params($params){
     	      $this->plotParam = $params;
	      $this->plotParam['xScaleMin'] = -$this->plotParam['xScaleMin'];
	      $this->plotParam['xScaleMax'] = -$this->plotParam['xScaleMax'];
     }

     

     function compile_data(){
     	      $data = array();
	      $data['name'] = $this->continName;
	      $data['series'] = $this->db;
	      $data['cellBody'] = $this->cellBody->get_data();
	      $data['preSynapse'] = $this->preSynapse->get_synapses();
	      $data['postSynapse'] = $this->postSynapse->get_synapses();
	      $data['gapJunction'] = $this->gapJunction->get_synapses();
	      $data['nmj'] = array();
	      $data['remarks'] = $this->remarks;
	      foreach($this->series as $s => $v){
                      $data[$s] = $this->series[$s]->get_data();
              }
	      $data['plotParam'] = $this->plotParam;
	      return $data;     
     }
}     



class TraceLocation {
      
      function __construct(){
      	       $this->x = array();
	       $this->y = array();
	       $this->z = array();
	       $this->cb = array();
      }
      
      function add_x($x1,$x2){
      	       $this->x[] = array(-$x1,-$x2);
      }

      function add_y($y1,$y2){
      	       $this->y[] = array($y1,$y2);
      }
      
      function add_z($z1,$z2){
      	       $this->z[] = array($z1,$z2);
      }
            
      function add_cb($cb){
      	       $this->cb[] = $cb;
      }     

      function get_data(){
      	       $tmp = array(
			'x' => $this->x,
			'y' => $this->y,
			'z' => $this->z,
			'cb' => $this->cb
			);
	       return $tmp;	
      }
}



class TraceSynapse{

      function __construct(){
      	       $this->synapses = array();	       
      }

      function add_synapse($x,$y,$z,$secs,$label,$z1,$z2,$cont,$pre,$post){
      	       $this->synapses[] = array(-$x,$y,$z,$secs,$label,
					$z1,$z2,$cont,$pre,$post);
      }

      function get_synapses(){
      	       return $this->synapses;
      }
}


?>
