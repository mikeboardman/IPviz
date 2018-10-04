/*
  Zooming and rotating HTML5 video player
  Homepage: http://github.com/codepo8/rotatezoomHTML5video
  Copyright (c) 2011 Christian Heilmann
  Code licensed under the BSD License:
  http://wait-till-i.com/license.txt
*/
/* predefine zoom and rotate */
  var zoom = 1, rotate = 0;

(function(){
/* Grab the necessary DOM elements */
  var stage = document.getElementById('stage'),
      v = document.getElementsByTagName('video')[0],
      controls = document.getElementById('controls');
      canvas = document.getElementById('color_sketch');

/* Array of possible browser specific settings for transformation */
  var properties = ['transform', 'WebkitTransform', 'MozTransform',
                    'msTransform', 'OTransform'],
      prop = properties[0];

/* Iterators and stuff */
  var i,j,t;

/* Find out which CSS transform the browser supports */
  for(i=0,j=properties.length;i<j;i++){
    if(typeof stage.style[properties[i]] !== 'undefined'){
      prop = properties[i];
      break;
    }
  }

/* Position video */
  v.style.left = 0;
  v.style.top = 0;

/* If there is a controls element, add the player buttons */
/* TODO: why does Opera not display the rotation buttons? */
  if(controls){
    controls.innerHTML =  ''+
                          '<div id="change">' +
                            '<button class="zoomin">+</button>' +
                            '<button class="zoomout">–</button>' +
                            '<button class="left">&#8672;</button>' +
                            '<button class="right">&#8674;</button>' +
                            '<button class="up">&#8673;</button>' +
                            '<button class="down">&#8675;</button>' +
                            '<button class="rotateleft">&#x21bb;</button>' +
                            '<button class="rotateright">&#x21ba;</button>' +
                            '<button class="reset">Reset</button>' +
                            '<button class="fullscreen pull-right">Full Screen</button>' +
                          '</div>';
  }

/* If a button was clicked (uses event delegation)...*/
  controls.addEventListener('click',function(e){
    t = e.target;
    if(t.nodeName.toLowerCase()==='button'){

/* Check the class name of the button and act accordingly */
      switch(t.className){

/* Increase zoom and set the transformation */
        case 'zoomin':
          zoom = zoom + 0.1;
          v.style[prop]='scale('+zoom+') rotate('+rotate+'deg)';
        break;

/* Decrease zoom and set the transformation */
        case 'zoomout':
          zoom = zoom - 0.1;
          v.style[prop]='scale('+zoom+') rotate('+rotate+'deg)';
        break;

/* Increase rotation and set the transformation */
        case 'rotateleft':
          rotate = rotate + 5;
          v.style[prop]='rotate('+rotate+'deg) scale('+zoom+')';
        break;
/* Decrease rotation and set the transformation */
        case 'rotateright':
          rotate = rotate - 5;
          v.style[prop]='rotate('+rotate+'deg) scale('+zoom+')';
        break;

/* Move video around by reading its left/top and altering it */
        case 'left':
          v.style.left = (parseInt(v.style.left,10) - 5) + 'px';
        break;
        case 'right':
          v.style.left = (parseInt(v.style.left,10) + 5) + 'px';
        break;
        case 'up':
          v.style.top = (parseInt(v.style.top,10) - 5) + 'px';
        break;
        case 'down':
          v.style.top = (parseInt(v.style.top,10) + 5) + 'px';
        break;

/* Reset all to default */
        case 'reset':
          zoom = 1;
          rotate = 0;
          v.style.top = 0 + 'px';
          v.style.left = 0 + 'px';
          v.style[prop]='rotate('+rotate+'deg) scale('+zoom+')';
        break;
/* Full Screen */
        case 'fullscreen pull-right':
          // displayArea = document.getElementById('display');
          // captureArea = document.getElementById('capture');
          // displayArea.style.top=0;
          // displayArea.style.left=0;
          // displayArea.style.width="100%";
          // displayArea.style.height="100%";
          // captureArea.style.width="100%";
          // captureArea.style.height="100%";
          // if (displayArea.requestFullscreen) {
          //   displayArea.requestFullscreen();
          // } else if (displayArea.mozRequestFullScreen) {
          //   displayArea.mozRequestFullScreen(); // Firefox
          // } else if (displayArea.webkitRequestFullscreen) {
          //   displayArea.webkitRequestFullscreen(); // Chrome and Safari
          // }

          if (v.requestFullscreen) {
            v.requestFullscreen();
          } else if (v.mozRequestFullScreen) {
            v.mozRequestFullScreen(); // Firefox
          } else if (v.webkitRequestFullscreen) {
            v.webkitRequestFullscreen(); // Chrome and Safari
          }
        break;
      }

      e.preventDefault();
    }
  },false);
})();

