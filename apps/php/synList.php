<?php
include('./php/dbaux.php');
$continName = $_GET['continName'];
$series = $_GET['series'];

$continName = str_ireplace('sleep','',$continName);
$series = str_ireplace('sleep','',$series);

if ($series == 'herm'){
   $headers = array("Head(N2U)","Tail(JSE)");
} elseif ($series == 'male'){
  $headers = array("Head(N930)","Tail(N2Y)");
} elseif ($series == 'pharynx'){
  $headers = array("Pharynx(N2W)");
} else {
  echo "Series error!---$series";
}

?>

<html>
<head>
<font face ="helvetica">
<link rel="stylesheet" type="text/css" href="./css/list3.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script id="test" language="javascript" type="text/javascript">	
$(document).ready(function() {
	$('[data-toggle="toggle"]').change(function(){
		$(this).parents().next('.hide').toggle();
	});
});
</script>
</head>
<body>
<a href="./neuronPage.php?cell=<?php echo $continName?>&series=<?php echo $series?>">Return to <?php echo $continName ?></a>&nbsp&nbsp&nbsp&nbsp
<a href="<?php echo "./partnerList.php?continName=$continName&series=$series";?>">Partner List</a>
<br>
<title><?php echo $continName ?> Synapse List</title>
<center>

<br>

<br><br>
<table width="75%">


<tr><td colspan=5>&nbsp; &nbsp;</td></tr>
<tr><td colspan=5><h1>List of synapses</h1></td></tr>
<tr><td colspan=5><hr></td></tr>
<tr><td colspan=5><h2>Cell Name: <?php echo $continName ?></td></tr><tr><td colspan=5>&nbsp; &nbsp;</td></tr>

<tr><td colspan=5><hr></td></tr>

<tr><td colspan=5>&nbsp; &nbsp;</td></tr>
<br>
<tr><td colspan=5>Notes:</td></tr>
<tr><td colspan=5><i><strong>1.  Click on target cells to expand/collapse synapse list. Synapse IDs linke to EMs.</strong></i></td></tr>
<tr><td colspan=5><i>2.  Bracketed Cells (e.g.[PVX]) denotes an inferred process identification (not traced to Cell Body)</i></td></tr>
<tr><td colspan=5><i>3.  unk denotes an unkown neurite process identification</i></td></tr>
<tr><td colspan=5><i>4.  In synapse lists, the listed order of postsynaptic cells in polyads represents the clockwise order of the cells around the presynaptic density, electron micrographs viewed looking toward the head.  Thus, R9AL>DVF,HOB,PVY represents a synapse that appears like this in the electron micrograph:</i></td>
<tr><td colspan=5><i>5.  A 'nmj_' in front a synapse denotes a neuromuscular junction.</i></td>
<tr><td colspan=5><i>6.  Occasionally, synapes do not display properly in the maps. In cases where there is a discrepancy between the maps and this synapse list, this synapse list should be considered correct. </i><td> 
<td><img src="./images/synapseexample.png" width="125"></td></tr>
<tr><td colspan=5>&nbsp; &nbsp;</td></tr>

<table id="mainList">
<tr>
	<th colspan=6><b>Gap junction partners of <?php echo $continName ?> ---- Click on target cell to expand/collapse synapse list</b></th>
</tr>
<tr>
	<th colspan=1 class="rcol"><b>Target</b></th>
	<th colspan=1 class="lcol"><b>Data series</b></th>
	<th colspan=1 class="lcol"><b>Synapse ID</b></th>
	<th colspan=1 class="lcol"><b>Section #</b></th>
	<th colspan=1 class="lcol"><b>#Synapses</b></th>
	<th colspan=1 class="lcol"><b>#Sections</b></th>
</tr>
<?php
$syn = get_gap_junction_synapses($series,$continName);
$syn->print_table('labels','hide');
?>
</table>
<br>
<table id="mainList">
<tr>
	<th colspan=6><b>Chemical synapses where <?php echo $continName ?> is presynaptic ----- Click on target cell to expand/collapse synapse list</b></th>
</tr>
<tr></tr>
<tr>
	<th colspan=1 class="rcol"><b>Target</b></th>
	<th colspan=1 class="lcol"><b>Data series</b></th>
	<th colspan=1 class="lcol"><b>Synapse ID</b></th>
	<th colspan=1 class="lcol"><b>Section #</b></th>
	<th colspan=1 class="lcol"><b>#Synapses</b></th>
	<th colspan=1 class="lcol"><b>#Sections</b></th>
</tr>
<?php
$syn = get_pre_chemical_synapses($series,$continName);
$syn->print_table('labels','hide');
?>
</table>
<br>
<table id="mainList">
<tr>
	<th colspan=6><b>Chemical synapses where <?php echo $continName ?> is postsynaptic ----- Click on target cell to expand/collapse synapse list</b></th>
</tr>
<tr></tr>
<tr>
	<th colspan=1 class="rcol"><b>Target</b></th>
	<th colspan=1 class="lcol"><b>Data series</b></th>
	<th colspan=1 class="lcol"><b>Synapse ID</b></th>
	<th colspan=1 class="lcol"><b>Section #</b></th>
	<th colspan=1 class="lcol"><b>#Synapses</b></th>
	<th colspan=1 class="lcol"><b>#Sections</b></th>
</tr>
<?php
$syn = get_post_chemical_synapses($series,$continName);
$syn->print_table('labels','hide');
?>


</table>
</center>
<br><br>
</body>
</html>

