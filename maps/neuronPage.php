<?php
//Redirect page for WormAtlas
$cell = $_GET['cell'];
$sex = $_GET['series'];

if ($sex == 'fullanimal'){
   $sex = 'herm';
} elseif ($sex == 'fullanimal_male'){
  $sex = 'male';
} elseif ($sex == 'pharynx'){
  $series = 'pharynx';
} else {
  $series = -1;
}

$link = '../ww/apps/include/php/redirectMaps.php?cell='.$cell.'&sex='.$sex;

header("Location: $link");
exit();

?>

