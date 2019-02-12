<?php

//Detect if IE browser being used
function ae_detect_ie()
{
 if (isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
        return true;
    else
        return false;
}

//bracket scrubber
function remove_bracket($str){
  return str_replace(array('[',']'),'',$str);
}

function order_array_by_rows($nodes,$numRows)
{
 $N = count($nodes);
 $numCols = 5;
 $nodes2 = array();
 //$idx = 0;
 for ($i = 0; $i < $numRows; $i++){
   for ($j = 0; $j < $numCols; $j++){
     $idx = $i + $numRows*$j;
	if ($idx < $N) {
	 array_push($nodes2,$nodes[$idx]);
	} else {
	 array_push($nodes2,"");
	}
    }
  }
  return $nodes2;	 	
}


//Read file into (key,val) array

function read_into_array($fname)
{
  echo $fname;	
  $lines = array();
  $fp = fopen($fname,'r');
  while(!feof($fp))
  {
   $line = fgets($fp);
   $vals = explode(",",$line);
   $lines[$vals[0]] = isset($vals[1]) ? trim($vals[1]) : '';
  }
  fclose($fp);
  return $lines;
}


//Format cell list to populate cell table
function format_cell_list($fname,$rows,$cols)
{
  $cells = file($fname);
  $N = count($cells);
  $idx = 0;
  $cells2 = array();
  for ($i=0;$i<$rows;$i++){
    for ($j=0;$j<$cols;$j++){
      $kdx = $i+$rows*$j;
      if ($kdx < $N){
       array_push($cells2,$cells[$kdx]);
      } 
    }
  }
  return $cells2;  
}


//Populate cell table
function populate_cell_table($cells,$series,$rows,$cols,$style,$href,$target)
{
  $N = count($cells);	
  $table="";
  for ($i=0;$i<$rows;$i++){
    $table .= "<tr>";  
    for ($j=0;$j<$cols;$j++){
      //$k = $i + $j;
      $k = $i + $rows*$j;	   
      if ($k < $N){	
        $td =  '<td class="style2"><h2>'.
             '<a class="'.$style.'" '.
             'target="'.$target.'" '.
	     'href="'.$href.'?cell='.
	     $cells[$k].'&series='.$series.'">'.
	     $cells[$k].
             '</a></h2></td>';
        $table .= $td;
     }
    }
    $table .= "</tr>";
  }
  
  return $table;
}

function get_wa_link($neuron){
	$file = "../cell_files/wa_link.txt";
	$array = get_csv($file);
	if (array_key_exists($neuron,$array)){
	   $n =  $array[$neuron];
	   return 'http://www.wormatlas.org/neurons/Individual%20Neurons/'.$n.'frameset.html';
	} else {
	   return -1;	
	}
}	 
	 
function get_wa_image($neuron){
	 $file = "../cell_files/wa_images.txt";
	 $array = get_csv($file);
	 if (array_key_exists($neuron,$array)){
	    $n =  $array[$neuron];
	    return 'http://wormatlas.org/neurons/Images/'.$n.'.jpg';
	    
	 } else {
	   return -1;
	 }
}

function get_csv($file){
	$file = fopen($file,'r');
	$array = array();
	while ($line = fgetcsv($file)){
	      $key = array_shift($line);
	      $array[$key] = $line[0];
	}
	fclose($file);
	return $array;
}




?>
