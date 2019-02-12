<?php
include('dbconnect.php');

$_db = new DB();
$_db->connect('Emmons_N2U');
$data = $_db->cell_objects('ASHL');
$str ="'".implode("','",$data)."'";
print_r($data);
echo $str;
?>
