<?php
//$ini = '../../../private/config.ini';
$ini = '/var/www/private/config.ini';
class DB {
      static $con;      
      var $result;      
      
      function __construct(){
      	       $ini = "../private/config.ini";
	       while (!file_exists($ini)){
	       	     $ini = "../".$ini;	       	     
	       }
	       $this->ini = $ini;    
      }

      function set_ini($new_ini){
      	       $this->ini = $new_ini;
      }
      
      function get_init(){
      	       return $this->ini;
      }

      function connect($db){
      	       $this->db = $db;
      	       static $connection;
	       if (!isset($con)){
	       	  $config = parse_ini_file($this->ini);
		  if (array_key_exists('port',$config)){
		     $this->con = new mysqli($config['servername'],
                     		             $config['username'],
                                             $config['password'],
					     $db,
					     $config['port']);

		  } else {
		     $this->con = new mysqli($config['servername'],
		     		             $config['username'],
					     $config['password'],
					     $db);
                  }			  
		  if($this->con === false){
		     die('Connect Error: ' . $this->con->connect_error());
		  }
       	       }
      }


      function select_db($_db){
      	       $this->con->select_db($_db);
      }

      function get_desc($cell){
               $table = 'neurondesc';
	       $sql = "select name2,type,location,notes 
	       	      from $table where name like '$cell'";
	       $this->result = $this->con->query($sql);
	       $row = $this->result->fetch_assoc();
	       $this->result->free();
	       return $row; 
      }     

      function _return_query_rows($sql){
	       $rows = array();
	       if ($this->result = $this->con->query($sql)){
	       	  while($row = $this->result->fetch_array(MYSQLI_NUM)){
	       		     $rows[] = $row;
	          }
	       	  $this->result->free();
	       }  
	       return $rows;
      }      

      function _return_query_rows_assoc($sql){
	       $rows = array();
	       if ($this->result = $this->con->query($sql)){
	       	  while ($row = $this->result->fetch_array(MYSQLI_ASSOC)){
		  	$rows[] = $row;
		  }
		  $this->result->free();	
	       }
	       return $rows;
      } 


      function _return_value_assoc($sql,$assoc){
      	      $val = -1;
	      if ($this->result = $this->con->query($sql)){
	      	 $tmp = $this->result->fetch_array();
		 $val = $tmp[$assoc];
	      }
	      return $val;	      
      }

      function get_contin_names(){
      	       $sql = "select distinct(CON_AlternateName) 
	       	      from contin
		      where type in ('neuron','muscle')
		      and CON_AlternateName not like '%contin%'";
	       $rows  = array();
	       if ($this->result = $this->con->query($sql)){
	          while ($row = $this->result->fetch_array(MYSQLI_NUM)){
		      $rows[] = $row[0];
		  };
               };		      
	       return $rows;
      }     
	   
      function get_gap_junction_partners($continName){
      	       $sql = "select pre,post,count(*),sum(sections) as sects, 
	       	      concat(pre,post) as name 
		      from synapsenomultiple 
		      where ( pre ='$continName' 
		      or pre=concat('[','$continName',']') 
		      or post=concat('[','$continName',']') 
		      or post='$continName' ) 
		      and type = 'electrical' 
		      group by name order by sects desc ";
	       
	       return $this->_return_query_rows($sql);
      }

      function get_gap_junction_synapses0($continName){
      	       $sql = "select pre,post,count(*),sum(sections) as sects, 
	       	      concat(pre,post) as name,continNum 
		      from synapsecombined 
		      where ( pre ='$continName' 
		      or pre=concat('[','$continName',']') 
		      or post=concat('[','$continName',']') 
		      or post='$continName' ) and type = 'electrical' 
		      group by name order by sects desc ";
		      
	        return $this->_return_query_rows($sql);
      }

      function get_gap_junction_synapses($continName){
      	       $sql = "select pre,post,sections,continNum,
	       	      image.IMG_SectionNumber from synapsecombined 
		      join object on
		      synapsecombined.mid = object.OBJ_Name
		      join image on
		      object.IMG_Number = image.IMG_Number 
		      where (pre like '%$continName%' 
		      or post like '%$continName%') 
		      and synapsecombined.type like 'electrical' 
		      order by pre desc,sections desc";
	       
	       return $this->_return_query_rows($sql);
      }

      function get_pre_chemical_partners($continName){
      	       $sql = "select post,count(*),sum(sections) as sects 
	       	      from synapsenomultiple 
		      where ( pre = '$continName' 
		      or pre=concat('[','$continName',']') )  
		      and type = 'chemical' 
		      group by post order by sects desc ";
		      
	       return $this->_return_query_rows($sql);
      }

      function get_pre_chemical_synapses0($continName){
      	       $sql = "select count(*),post,sum(sections),
	       	      type2 as sects,continNum  
		      from synapsecombined 
		      where ( pre = '$continName' 
		      or pre=concat('[','$continName',']')) 
		      and type ='chemical' 
		      group by post order by sects desc";

	       return $this->_return_query_rows($sql);
      }

      function get_pre_chemical_synapses($continName){
      	       $sql = "select pre,post,sections,continNum,
	       	      image.IMG_SectionNumber from synapsecombined 
		      join object on
		      synapsecombined.mid = object.OBJ_Name
		      join image on
		      object.IMG_Number = image.IMG_Number 
		      where pre like '%$continName%' 
		      and synapsecombined.type like 'chemical' 
		      order by pre desc,sections desc";
	       
	       return $this->_return_query_rows($sql);
      }      

      function get_post_chemical_partners($continName){
      	       $sql = "select pre,count(*),sum(sections) as sects 
	       	      from synapsenomultiple 
		      where ( post = '$continName' 
		      or post=concat('[','$continName',']') )  
		      and type = 'chemical' 
		      group by pre order by sects desc ";
		$sql = str_ireplace('sleep','',$sql);
	       return $this->_return_query_rows($sql);
      }

      function get_post_chemical_synapses0($continName){
      	       $sql = "select count(*),pre,post,sum(sections),
	       	      type2 as sects, concat(pre,post) as name,continNum  
		      from synapsecombined 
		      where ( post1 = '$continName' 
		      or post1=concat('[','$continName',']') 
		      or post2 = '$continName' 
		      or post2=concat('[','$continName',']') 
		      or post3 = '$continName' 
		      or post3=concat('[','$continName',']') 
		      or post4 = '$continName' 
		      or post4=concat('[','$continName',']') )  
		      and type ='chemical' 
		      group by name order by sects desc";
		$sql = str_ireplace('sleep','',$sql);      
	 	return $this->_return_query_rows($sql);
      }

      function get_post_chemical_synapses($continName){
      	       $sql = "select pre,post,sections,continNum,
	       	      image.IMG_SectionNumber from synapsecombined 
		      join object on
		      synapsecombined.mid = object.OBJ_Name
		      join image on
		      object.IMG_Number = image.IMG_Number 
		      where (post like binary '$continName'
		      or post like binary '%,$continName'
		      or post like binary '$continName,%'
                      or post like binary '%,$continName,%') 
		      and synapsecombined.type like 'chemical' 
		      order by pre desc,sections desc";
	       $sql = str_ireplace('sleep','',$sql);
	       return $this->_return_query_rows($sql);
      }      


     function has_cell($cell){
     	      $sql = "select CON_AlternateName from contin
	      	     where CON_AlternateName 
		     like '%$cell%'";
              $this->result = $this->con->query($sql);
	      $bool = true;
	      if($this->result->num_rows == 0){
	         $bool =  false;
	      }
	      $this->result->free(); 
	      return $bool;
     }           

     function get_image_data($continNum){
     	      $sql = "select synapsecombined.pre as pre,
	      	     synapsecombined.post as post,
	      	     object.OBJ_Name as objNum,
		     object.IMG_Number as imgNum,
		     image.IMG_SectionNumber as sectNum,
		     image.IMG_File as file,
		     image.IMG_Series as series,
		     object.type as type 
		     from object 
		     join synapsecombined 
		     on object.CON_Number = synapsecombined.continNum 
		     join image 
		     on object.IMG_Number = image.IMG_Number 
		     where CON_Number = $continNum
		     order by image.IMG_SectionNumber";
		
		$rows = array();
		     
	       	if ($this->result = $this->con->query($sql)){
	       	  while($row = $this->result->fetch_array(MYSQLI_ASSOC)){
	       		     $rows[$row['objNum']] = $row;
	          }
		 }	     
	       return $rows;
     }

     function get_object_xy($objName){
     	      $sql = "select OBJ_X as x,
	      	     OBJ_Y as y 
		     from object 
		     where OBJ_Name = $objName";     
	       $row = array();
	       if ($this->result = $this->con->query($sql)){
	       	  $row = $this->result->fetch_array(MYSQLI_ASSOC);
	       }
	       return $row;
     }

     function get_object_xyz($objName){
     	      $sql = "select OBJ_X as x,
	      	     	     OBJ_Y as y,
			     image.IMG_SectionNumber as z 
		      from object join image 
		      on object.IMG_Number = image.IMG_Number 
		      where object.OBJ_Name = $objName";
	       $row = array();
	       if ($this->result = $this->con->query($sql)){
	       	  $row = $this->result->fetch_array(MYSQLI_ASSOC);
	       }
	       return $row;
     }

     function get_synapse_cell_objects($continNum){
     	      $sql = "select preobj as pre,
	      	     postobj1 as post1,
	      	     postobj2 as post2,
		     postobj3 as post3,
		     postobj4 as post4
		     from synapsecombined
		     where continNum = $continNum";
	      $row = array();
	      if ($this->result = $this->con->query($sql)){
	      	 $row = $this->result->fetch_array(MYSQLI_ASSOC);
	      }
	      return array_filter($row, function($value) { return $value !== ''; });
     }

     function get_synapse_pre_post($continNum){
     	      $sql = "select pre as pre, post as post, 
	              sections as sections 
	      	     from synapsecombined 
		     where continNum = $continNum";
	      $row = array();
	      if ($this->result = $this->con->query($sql)){
	      	 $row = $this->result->fetch_array(MYSQLI_ASSOC);
	      }
	      return array_filter($row, function($value) { return $value !== ''; });	      	     
     }
	
     function remove_bracket($str){
     	      return str_replace(array('[',']'),'',$str);
     }
	
     function add2dict($array,$row,$l1,$l2){
	      if ($row[$l1] != ''){
                  $tmp = $this->remove_bracket($row[$l1]);
	      	  $array[$tmp] = $row[$l2];
	      }
 	      return $array;	      	       
     }
	      
     
     function get_synapse_cell_object_dict($continNum){
	      $sql = "select pre,post1,post2,post3,post4,
	      	     	     preobj,postobj1,postobj2,postobj3,postobj4
		      from synapsecombined
		      where continNum = $continNum";
	      $row = array();
	      if ($this->result = $this->con->query($sql)){
	      	 $row = $this->result->fetch_array(MYSQLI_ASSOC);
	      }
	      $dict = array();
	      $dict = $this->add2dict($dict,$row,'pre','preobj');
	      $dict = $this->add2dict($dict,$row,'post1','postobj1');
	      $dict = $this->add2dict($dict,$row,'post2','postobj2');
	      $dict = $this->add2dict($dict,$row,'post3','postobj3');
	      $dict = $this->add2dict($dict,$row,'post4','postobj4');
	      return $dict;
     }

     function get_synapse_section_range($continNum){
     	      $sql = "select sectionNum1,sectionNum2 
	      	     from contin 
		     where CON_Number = $continNum";
	      $row = array();
	      if ($this->result = $this->con->query($sql)){
	      	 $row = $this->result->fetch_array(MYSQLI_ASSOC);
	      }
	      return $row;
     }     

     function get_object_section_number($object){
     	      $sql = "select IMG_SectionNumber 
	      	     from image 
		     join object on 
		     image.IMG_Number = object.IMG_Number
		     where object.OBJ_Name = $object";
	      $val = $this->_return_value_assoc($sql,'IMG_SectionNumber');	   
	      return $val;
     }

     function get_object_contin($obj){
     	      $sql = "select CON_Number 
	      	     from object
		     where OBJ_Name = $obj";
	      $val = $this->_return_value_assoc($sql,'CON_Number');
	      return $val;
     }     

     function get_section_contin_object($sectNum,$contin){
     	      $sql = "select OBJ_Name 
	      	     from object join 
		     image on 
		     object.IMG_Number = image.IMG_Number
		     where image.IMG_SectionNumber = $sectNum
		     and CON_Number = $contin";
	      $rows = array();
	      if ($this->result = $this->con->query($sql)){
	      	 while ($row = $this->result->fetch_array()){
		 	$rows[] = $row['OBJ_Name'];
		};
	      }
	      return $rows;
     }

     function get_contin_name($contin){
     	      $sql = "select CON_AlternateName 
	      	     from contin
		     where CON_Number = $contin";
	      $val = $this->_return_value_assoc($sql,'CON_AlternateName');	   
	      return $val;
     }
     
     function get_synapse_type($contin){
     	      $sql = "select type 
	      	     from synapsecombined 
		     where continNum = $contin";
	      $val = $this->_return_value_assoc($sql,'type');	      
	      return $val;	      
     }    


     function get_contin_numbers($continName){
     	      $sql = "select CON_Number 
	      	     from contin 
		     where CON_AlternateName like '%$continName%'";
	 	     	     
     	      $rows = array();
	      if ($this->result = $this->con->query($sql)){
	      	 while ($row = $this->result->fetch_array(MYSQLI_ASSOC)){
			$rows[] = $row['CON_Number'];
		}
	      }
	      return $rows;
     }

     function get_contin_series($continNum){
     	      $sql = "select series 
	      	     from contin 
		     where CON_Number = $continNum";
		 
	      $val = $this->_return_value_assoc($sql,'series');
	      return explode(",",$val);
     }

     function get_series_display($contin,$series){
     	      $sql = "select x1,x2,y1,y2,z1,z2
	      	     from display2 
		     where continNum = $contin 
		     and series1 = $series";
      
	      return $this->_return_query_rows($sql);
     }

     function get_display3_series($continNum){
		$sql = "select distinct(series1) 
			from display2
			where continNum = $continNum";
	       $rows = array();
	       if ($this->result = $this->con->query($sql)){
		  while ($row = $this->result->fetch_array(MYSQLI_ASSOC)){
			$rows[] = $row['series1'];
		  }
		  $this->result->free();
	       }
	       return $rows;
     }
}

?>
