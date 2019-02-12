<?php
//Redirect page for WormAtlas

$name = $_GET['name'];
$db = $_GET['db'];

if ($db == 'fullanimal'){
   $series = 'herm';
} elseif ($db == 'fullanimal_male'){
  $series = 'male';
} elseif ($db == 'pharynx'){
  $series = 'pharynx';
} else {
  $series = -1;
}

$link = '../maps/neuronPage.php?cell='.$name.'&series='.$series;

header("Location: $link");
exit();

?>

