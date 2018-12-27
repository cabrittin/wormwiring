<?php

function syn_sort1($a,$b){
	 if ($a[2] == $b[2]){
	    return 0;
	 } 
	 return ($a[2] > $b[2]) ? -1 : 1;
}

function syn_sort2($a,$b){
	 if ($a[2] == $b[2]){
	    return 0;
	 } 
	 return ($a[4] < $b[4]) ? -1 : 1;
}

class Syn{
      var $list = array();
      var $synList = array();     
      
      function __construct($cell){
      	       $this->cell = $cell;
      }      
      
      
      
      function add_syn($syn){
      	       if (!array_key_exists($syn[0],$this->synList)){
	       	  $this->synList[$syn[0]] = array();
	       }
	       $this->synList[$syn[0]][] = $syn;
	       
	       if (!array_key_exists($syn[0],$this->list)){
	       	  $this->list[$syn[0]] = array($syn[0],0,0);
	       }
	       $this->list[$syn[0]][1] += 1;
	       $this->list[$syn[0]][2] += $syn[2];
      }	       

      function sort_list(){
      	       uasort($this->list,'syn_sort1');
      }
      
      function sort_synList($key){
      	       uasort($this->synList[$key],'syn_sort2');
      }

      function print_table($h1,$h2){
      	       $this->sort_list();
      	       foreach ($this->list as $r){
	       	       echo "<tbody class='$h1'>";
		       echo "<tr class='$h1'>
		       	    	 <td class='rcol'colspan='4'>
				 <label for='$r[0]'>$r[0]</label>
				 <input type='checkbox' name='$r[0]'
				  id='$r[0]' data-toggle='toggle'>
				 </td>
				 <td class='lcol'>$r[1]</td>
				 <td class='lcol'>$r[2]</td>
			     </tr>";
		       echo "</tbody>";
		       $this->sort_synList($r[0]);
		       echo "<tbody class='$h2' style='display:none;'>";
		       foreach ($this->synList[$r[0]] as $s){
		       	      echo "<tr>
			      	   	<td class='rcol'></td>
					<td class='lcol'>$s[1]</td>
					<td class='lcol'>
					    <a href='./getImages.php?neuron=$this->cell&db=$s[1]&continNum=$s[3]'>
					       $s[3]
					    </a>
					</td>
					<td class='lcol'>$s[4]</td>
					<td class='lcol'></td>
					<td class='lcol'>$s[2]</td>
				    </tr>";				 
		       }
		       echo "</tbody>";
	       }
      }
}
?>