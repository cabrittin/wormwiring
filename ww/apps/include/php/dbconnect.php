<?php
/*
dbconnect.php
 
Contains class DB for accesscing data from the database.

Methods:
--------
__construct() : 
	constructs the DB class. Requires file ../private.config.ini
set_ini(string $new_config_file) : 
	Sets the path to the configureation file.
get_init() : 
	Returns the path to the configuration file.
connect(string $database) : 
	Connects to the database.
select_db(string $database): 
	Selects or switiches to the database.
get_desc(string $cell) : 
	Returns the description of the cell.
_return_query_rows(string $sql): 
	Returns the results of the query as a list.
_return_query_rows_assoc(string $sql): 
	Returns the results of the query as a dictionary.
_return_value_assoc(string $sql, string $assoc): 
	Returns the results of the query for the field $assoc.
get_contin_names() : 
	Returns list of unique contin names.
get_gap_junction_partners(string $continName):
	Returns gap junction partners of contin. 
*/

class DB {
      var $con;      
      var $result;      
      
      function __construct(){
      	       $ini = "/var/www/private/config.ini";
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

      function cell_objects($cell){
      	$sql = "SELECT idobject
	     FROM object 
	     JOIN contin ON contin.idcontin = object.idcontin 
	     WHERE contin.continname LIKE '$cell'";
	$rows = array();
	if ($this->result = $this->con->query($sql)){
	  while($row = $this->result->fetch_assoc()){
	  	     $rows[] = $row['idobject'];
	  }
	}
	$this->result->free();
	return $rows;
      }     

   
      function _return_query_rows_single($sql){
	       $rows = array();
	       if ($this->result = $this->con->query($sql)){
	       	  while($row = $this->result->fetch_array(MYSQLI_NUM)){
	       		     $rows[] = $row[0];
	          }
	       	  $this->result->free();
	       }  
	       return $rows;
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
      	       $sql = "select distinct(continname) 
	       	      from contin
		      where type in ('neuron','muscle')";
	       $rows  = array();
	       if ($this->result = $this->con->query($sql)){
	          while ($row = $this->result->fetch_array(MYSQLI_NUM)){
		      $rows[] = $row[0];
		  };
               };		      
	       return $rows;
      }     

      function get_contin_ids($continName){
        $sql = "select idcontin from contin 
	     where continname like '%$continName%'";

	$rows = array();
	if ($this->result = $this->con->query($sql)){
	   while ($row = $this->result->fetch_array(MYSQLI_NUM)){
	   	 $rows[] = $row[0];
	   }
	}
	return $rows;
      }     

      function get_contin_series($continId){
        $sql = "select distinct(image.series) from image 
	     join object on object.idimage = image.idimage 
	     where object.idcontin = $continId";
	$rows  = array();
	if ($this->result = $this->con->query($sql)){
	    while ($row = $this->result->fetch_array(MYSQLI_NUM)){
	         $rows[] = $row[0];
	    };
         };		      
	 return $rows;
      }
      
      function get_gap_junction_partners($cellIds){
      	       $sql = "select preCont.continname as precell,
	       	    postCont.continname as postcell,
		    count(distinct(synCont.idcontin)) as numsyn,
		    count(*) as sects,
		    concat(preCont.continname,postCont.continname) as name
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where (synapse.idpre in ($cellIds) or synapse.idpost in ($cellIds))
		    and synCont.type = 'electrical' 
		    group by name order by sects desc";
	       
	       return $this->_return_query_rows($sql);
      }


      function get_gap_junction_synapses($cellIds){
      	       $sql = "select concat_ws('|-|', preCont.continname,postCont.continname),
		    synapse.idcontin as synId, 
		    min(image.sectionnumber) as sectnum, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where (
		    	  synapse.idpre in ($cellIds) or
			  synapse.idpost in ($cellIds)
			  )			  
		    and synCont.type = 'electrical' 
		    group by synId order by sectnum asc";
	       
	       return $this->_return_query_rows($sql);
      }

      function get_pre_display_synapses($cellIds,$type){
      	       $sql = "select preCont.continname as pre, postCont.continname as post,
		    synapse.idcontin as synId,
		    synObj.x as x, synObj.y as y, min(image.sectionnumber) as z,
		    min(image.sectionnumber) as sectNum1,
		    max(image.sectionnumber) as sectNum2, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where (
		    	  synapse.idpre in ($cellIds) or
			  synapse.idpost in ($cellIds)
			  )			  
		    and synCont.type = 'electrical' 
		    group by synId order by sectnum1 asc";


	       return $this->_return_query_rows_assoc($sql);
      }


      function get_pre_chemical_partners($cellIds){
         $sql = "select cellCont.continname as name,
	 	count(distinct(synCont.idcontin)) as numsyn, 
		count(*) as sects from synapse 
		join object as cellObj on cellObj.idobject = synapse.idpost 
		join contin as cellCont on cellCont.idcontin = cellObj.idcontin 
		join object as synObj on synObj.idobject = synapse.idsynapse 
		join contin as synCont on synCont.idcontin = synObj.idcontin 
		where synapse.idpre in ($cellIds) 
		and synCont.type = 'chemical' 
		group by name order by sects desc";

	 return $this->_return_query_rows($sql);
      }


      function get_pre_chemical_synapses($cellIds){
      	       $sql = "select concat_ws('->', preCont.continname, 
	       	    group_concat(distinct(postCont.continname) separator ',')),
		    synapse.idcontin as synId, 
		    min(image.sectionnumber) as sectnum, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where synapse.idpre in ($cellIds) 
		    and synCont.type = 'chemical' 
		    group by synId order by sectnum asc";

	       
	       return $this->_return_query_rows($sql);
      }


      function get_pre_chemical_synapses_trace($cellIds){
      	       $sql = "select preCont.continname as pre,
	       	    group_concat(distinct(postCont.continname) separator ',') as post,
		    dpre.x1 as x, dpre.y1 as y, min(image.sectionnumber) as z,
		    synapse.idcontin as synId, 
		    min(image.sectionnumber) as sectNum1,
		    max(image.sectionnumber) as sectNum2, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    join display as dpre on dpre.idobject1 = synapse.idpre
		    where synapse.idpre in ($cellIds) 
		    and synCont.type = 'chemical' 
		    group by synId order by z asc";

	       
	       return $this->_return_query_rows_assoc($sql);
      }      

      function get_post_chemical_partners($cellIds){
	$sql = "select cellCont.continname as name,
	     count(distinct(synCont.idcontin)) as numsyn, 
	     count(*) as sects from synapse 
	     join object as cellObj on cellObj.idobject = synapse.idpre 
	     join contin as cellCont on cellCont.idcontin = cellObj.idcontin 
	     join object as synObj on synObj.idobject = synapse.idsynapse 
	     join contin as synCont on synCont.idcontin = synObj.idcontin 
	     where synapse.idpost in ($cellIds) 
	     and synCont.type = 'chemical' 
	     group by name order by sects desc";

	return $this->_return_query_rows($sql);
      }



      function get_post_chemical_synapses($cellIds){
      	       $sql = "select concat_ws('->', preCont.continname, 
	       	    group_concat(distinct(postCont.continname) separator ',')),
		    synapse.idcontin as synId, 
		    min(image.sectionnumber) as sectnum, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where synapse.idsynapse in 
		    	  (select synapse.idsynapse 
			  from synapse 
			  where synapse.idpost in ($cellIds)) 
		    and synCont.type = 'chemical' 
		    group by synId order by sectnum asc";

	       return $this->_return_query_rows($sql);
      }

      
      function get_post_chemical_synapses_trace($cellIds){
      	       $sql = "select preCont.continname as pre, 
	       	    group_concat(distinct(postCont.continname) separator ',') as post,
		    synObj.x as x, synObj.y as y, min(image.sectionnumber) as z,
		    synapse.idcontin as synId, 
		    min(image.sectionnumber) as sectNum1,
		    max(image.sectionnumber) as sectNum2, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where synapse.idsynapse in 
		    	  (select synapse.idsynapse 
			  from synapse 
			  where synapse.idpost in ($cellIds)) 
		    and synCont.type = 'chemical' 
		    group by synId order by sectNum1 asc";

	       return $this->_return_query_rows_assoc($sql);
      }
      
      function get_synapse($synId){
      	       $sql = "select preCont.continname as source,
	       	    group_concat(distinct(postCont.continname) separator ',') as target, 
		    count(distinct(synapse.idsynapse)) as sections 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    where synapse.idcontin = $synId 
		    group by synapse.idcontin";
		   
	 		
	       $results =  $this->_return_query_rows_assoc ($sql);
	       return $results[0];
      }


      function get_synapse_image($synId){
      	       $sql = "select distinct(synapse.idsynapse) as synobject, 
	       	    image.imagename as imgname 
		    from synapse 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    where synapse.idcontin = $synId 
		    order by image.sectionnumber asc";
		   
		return $this->_return_query_rows_assoc($sql); 
      }     

      function get_synapse_type($synId){
      	$sql = "select distinct(contin.type) 
	     from contin 
	     join synapse on synapse.idcontin = contin.idcontin 
	     where synapse.idcontin = $synId";
	$result =  $this->_return_query_rows($sql);
	return $result[0][0];     
      }    

      function get_synapse_stats($synId){
       	       $sql = "select preCont.continname as pre, 
	       	    group_concat(distinct(postCont.continname) separator ',') as post,
		    synapse.idcontin as synId, 
		    min(image.sectionnumber) as sectNum1,
		    max(image.sectionnumber) as sectNum2, 
		    count(distinct(synapse.idsynapse)) as sects 
		    from synapse 
		    join object as preObj on preObj.idobject = synapse.idpre 
		    join contin as preCont on preCont.idcontin = preObj.idcontin 
		    join object as postObj on postObj.idobject = synapse.idpost 
		    join contin as postCont on postCont.idcontin = postObj.idcontin 
		    join object as synObj on synObj.idobject = synapse.idsynapse 
		    join image on image.idimage = synObj.idimage 
		    join contin as synCont on synCont.idcontin = synObj.idcontin 
		    where synapse.idcontin = $synId"; 

	$result =  $this->_return_query_rows_assoc($sql);
	return $result[0];
      }

      function get_synapse_xy($synObj){
      	$sql = "select x,y from object where idobject = $synObj";
	$result =  $this->_return_query_rows_assoc($sql);
	return $result[0];
      	       
      }

      function get_synapse_pre_xy($synObj){
      	$sql = "select distinct(continname) as cell,x,y 
	     from object 
	     join synapse on synapse.idpre = object.idobject 
	     join contin on contin.idcontin=object.idcontin 
	     where synapse.idsynapse = $synObj";
	$result =  $this->_return_query_rows_assoc($sql);
	return $result[0];
      }

      function get_synapse_post_xy($synObj){
        $sql = "select distinct(continname) as cell,x,y 
	     from object 
	     join synapse on synapse.idpost = object.idobject 
	     join contin on contin.idcontin=object.idcontin 
	     where synapse.idsynapse = $synObj";
	return $this->_return_query_rows_assoc($sql);
      }

      function get_object_image($obj){
        $sql = "select series,imagename 
	     from image join object 
	     on object.idimage = image.idimage 
	     where object.idobject = $obj";
	$result =  $this->_return_query_rows_assoc($sql);
	return $result[0];
      }

      function get_display_trace($continId){
      	$sql = "select idobject1,x1,y1,z1,cellbody1,remarks1,
	     idobject2,x2,y2,z2,cellbody2,remarks2
	     from display
	     where idcontin = $continId
	     order by z1 asc";	
	      
	return $this->_return_query_rows_assoc($sql);
      }

      function get_display_params(){
       $sql = "select min(x1) as xScaleMin, 
       	    max(x1) xScaleMax, min(y1) yScaleMin, 
	    max(y1) yScaleMax, min(z1) as zScaleMin, 
	    max(z1) as zScaleMax  from display";
        $result =  $this->_return_query_rows_assoc($sql);
	return $result[0];

      }

      function get_display_objects($contins){
        $sql = "select idobject1 from display where idcontin in ($contins)";
	return $this->_return_query_rows_single($sql);

      }

      function get_display_pre_synapses($cellIds,$type){
        $sql = "select synapse.idpre as cell,synapse.idcontin as synid
	     from synapse 
	     join contin on contin.idcontin = synapse.idcontin
	     where synapse.idpre in ($cellIds)
	     and contin.type = '$type'
	     group by synid";
	return $this->_return_query_rows_assoc($sql);

      }

      function get_display_post_synapses($cellIds,$type){
        $sql = "select synapse.idpost as cell,synapse.idcontin as synid
	     from synapse 
	     join contin on contin.idcontin = synapse.idcontin
	     where synapse.idpost in ($cellIds)
	     and contin.type = '$type'
	     group by synid";
	return $this->_return_query_rows_assoc($sql);

      }

      function get_display_object_xyz($idobject,$contins){
        $sql = "select x1 as x, y1 as y, z1 as z
	      from display where idobject1 = $idobject
	      and idcontin in ($contins)";
	$result =  $this->_return_query_rows_assoc($sql);
	return $result[0];
      }
}

?>
