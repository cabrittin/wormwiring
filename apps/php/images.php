<?php

class Image {

      function __construct($file){
      	       $this->file = $file;
	       $this->thickness = 25;
	       $this->maxWidth = 800;
	       $this->maxHeight = 800;	      
      }
      
      function set_dimensions($width,$height){
      	       $this->width = $width;
	       $this->height = $height;
      }

      function set_center($x0,$y0){
      	       $this->cx = $x0;
	       $this->cy = $y0;      
      }

      function load(){
      	       $this->img = imagecreatefromjpeg($this->file)
        		or die("Cannot create new JPEG image");
      }     


      function rect(){
      	       $this->load();
	       if ($this->img){
	       	  $this->_rect();
		  }
      }

      function _rect(){
	       $red = imagecolorallocate($this->img,255,0,0);
	
		for ($i=0; $i<=$this->thickness; $i++){
		
			$x1 = $this->cx - $i;
			$y1 = $this->cy - $i;
			$x2 = $x1 + $this->width + 2*$i;
			$y2 = $y1 + $this->height + 2*$i;
		
			imagerectangle($this->img,$x1,$y1,$x2,$y2,$red);
		}
	
		 
    		 $iOrigWidth = imagesx($this->img);
    		 $iOrigHeight = imagesy($this->img);
	
		$fScale = min($this->maxWidth/$iOrigWidth,
				$this->maxHeight/$iOrigHeight);

		if ($fScale < 1) {		   
		   $iNewWidth = floor($fScale*$iOrigWidth);
		   $iNewHeight = floor($fScale*$iOrigHeight);

		   $tmpimg = imagecreatetruecolor($iNewWidth,
						   $iNewHeight);

		   imagecopyresampled($tmpimg, $this->img, 0, 0, 0, 0,
		   		$iNewWidth, $iNewHeight, $iOrigWidth, 
				$iOrigHeight);
		
		   imagedestroy($this->img);				
		   $this->img = $tmpimg;
		   //imagedestroy($tmpimg);
		}      	       
      }

      function show(){
      	       ob_start();
	       imagejpeg($this->img,NULL,100);
	       $rawImageBytes = ob_get_clean();
	       echo "<img src='data:image/jpeg;base64,".base64_encode($rawImageBytes)."'/>";	       
      }

      function encode(){
      	       ob_start();
	       imagejpeg($this->img,NULL,100);
	       $rawImageBytes = ob_get_clean();
	       return base64_encode($rawImageBytes);			
      }     

      function clear(){
      	       imagedestroy($this->img);
      }


      function crop($cellsyn){
      	       $this->load();
	       if ($this->img){
	       	  $this->_crop($cellsyn);
		  }
      }

      function _crop($cellsyn){
	       
	       if ($cellsyn['synapse']->get_type() == 'electrical'){
	       	  $pre = imagecolorallocate($this->img,0,255,255);
		  $post = imagecolorallocate($this->img,0,255,255);
	       } else {
	       	 $pre = imagecolorallocate($this->img,250,88,130);	
		 $post = imagecolorallocate($this->img,191,0,255);
	       }	 

	       $white = imagecolorallocate($this->img, 255, 255, 255);
	       $red = imagecolorallocate($this->img,255,0,0);
	       $font = './font.ttf';   	
	       
	       imagettftext($this->img,15,0,
				$cellsyn['synapse']->get_x(),
				$cellsyn['synapse']->get_y(),
				$red,$font,'x');

	       imagettftext($this->img,15,0,
				$cellsyn['pre']->get_x(),
				$cellsyn['pre']->get_y(),
				$pre,$font,$cellsyn['pre']->get_name());

	       $tmp = array('post1','post2','post3','post4');
	       foreach ($tmp as $k){
	       	       if (array_key_exists($k,$cellsyn)){
				imagettftext($this->img,15,0,
					$cellsyn[$k]->get_x(),
					$cellsyn[$k]->get_y(),
					$post,$font,$cellsyn[$k]->get_name());
			}
		}		       	  

	       $tmpimg = imagecreatetruecolor($this->width,$this->height);
	       imagecopyresized($tmpimg,$this->img,0,0,$this->cx,$this->cy,
			        $this->width,$this->height,
				$this->width,$this->height);

		imagedestroy($this->img);
		$this->img = $tmpimg;		
      }


}

?>
