
// Custom Cursor
// init plugin
// $( function() {
//     NodeCursor({
//         cursor : true, 
//         node : true, 
//         cursor_velocity : 1, 
//         node_velocity : 0.15, 
//         native_cursor : 'none', 
//         element_to_hover : '.nodeHover', 
//         cursor_class_hover : 'disable', 
//         node_class_hover : 'expand', 
//         hide_mode : false, 
//         hide_timing : 2000, 
//     });

// });

// set the starting position of the cursor outside of the screen
let clientX = -100;
let clientY = -100;
const innerCursor = document.querySelector(".cursor-small");

const initCursor = () => {
  // add listener to track the current mouse position
  document.addEventListener("mousemove", e => {
    clientX = e.clientX;
    clientY = e.clientY;
  });
  
  // transform the innerCursor to the current mouse position
  // use requestAnimationFrame() for smooth performance
  const render = () => {
    innerCursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
    // if you are already using TweenMax in your project, you might as well
    // use TweenMax.set() instead
    // TweenMax.set(innerCursor, {
    //   x: clientX,
    //   y: clientY
    // });
    
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
};

initCursor();


let lastX = 0;
let lastY = 0;
let isStuck = false;
let showCursor = false;
let group, stuckX, stuckY, fillOuterCursor;

//Change th dimensions
const initCanvas = () => {
  const canvas = document.querySelector(".cursor-canvas");
  const shapeBounds = {
    width: 80,
    height: 80
  };
  paper.setup(canvas);
  
  //Change the color, segments(8,16,32...)
  const strokeColor = "#3b3a39";
  const strokeWidth = 2;
  const segments = 20;
  const radius = 100;
  
  // we'll need these later for the noisy circle
  const noiseScale = 150; // speed
  const noiseRange = 4; // range of distortion
  let isNoisy = false; // state
  
  // the base shape for the noisy circle
  const polygon = new paper.Path.RegularPolygon(
    new paper.Point(0, 0),
    segments,
    radius
  );
  polygon.strokeColor = strokeColor;
  polygon.strokeWidth = strokeWidth;
  polygon.smooth();
  group = new paper.Group([polygon]);
  group.applyMatrix = false;
  
  const noiseObjects = polygon.segments.map(() => new SimplexNoise());
  let bigCoordinates = [];
  
  // function for linear interpolation of values
  const lerp = (a, b, n) => {
    return (1 - n) * a + n * b;
  };
  
  // function to map a value from one range to another range
  const map = (value, in_min, in_max, out_min, out_max) => {
    return (
      ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    );
  };
  
  // the draw loop of Paper.js 
  // (60fps with requestAnimationFrame under the hood)
// the draw loop of Paper.js
// (60fps with requestAnimationFrame under the hood)
paper.view.onFrame = event => {
  // using linear interpolation, the circle will move 0.2 (20%)
  // of the distance between its current position and the mouse
  // coordinates per Frame
  if (!isStuck) {
    // move circle around normally
    lastX = lerp(lastX, clientX, 0.2);
    lastY = lerp(lastY, clientY, 0.2);
    group.position = new paper.Point(lastX, lastY);
  } else if (isStuck) {
    // fixed position on a nav item
    lastX = lerp(lastX, stuckX, 0.2);
    lastY = lerp(lastY, stuckY, 0.2);
    group.position = new paper.Point(lastX, lastY);
  }
  
  if (isStuck && polygon.bounds.width < shapeBounds.width) { 
    // scale up the shape 
    polygon.scale(2.08);
  } else if (!isStuck && polygon.bounds.width > 30) {
    // remove noise
    if (isNoisy) {
      polygon.segments.forEach((segment, i) => {
        segment.point.set(bigCoordinates[i][0], bigCoordinates[i][1]);
      });
      isNoisy = false;
      bigCoordinates = [];
    }
    // scale down the shape
    const scaleDown = 0.92;
    polygon.scale(scaleDown);
  }
  
  // while stuck and big, apply simplex noise
  if (isStuck && polygon.bounds.width >= shapeBounds.width) {
    isNoisy = true;
    // first get coordinates of large circle
    if (bigCoordinates.length === 0) {
      polygon.segments.forEach((segment, i) => {
        bigCoordinates[i] = [segment.point.x, segment.point.y];
      });
    }
    
    // loop over all points of the polygon
    polygon.segments.forEach((segment, i) => {
      
      // get new noise value
      // we divide event.count by noiseScale to get a very smooth value
      const noiseX = noiseObjects[i].noise2D(event.count / noiseScale, 0);
      const noiseY = noiseObjects[i].noise2D(event.count / noiseScale, 1);
      
      // map the noise value to our defined range
      const distortionX = map(noiseX, -1, 1, -noiseRange, noiseRange);
      const distortionY = map(noiseY, -1, 1, -noiseRange, noiseRange);
      
      // apply distortion to coordinates
      const newX = bigCoordinates[i][0] + distortionX;
      const newY = bigCoordinates[i][1] + distortionY;
      
      // set new (noisy) coodrindate of point
      segment.point.set(newX, newY);
    });
    
  }
  polygon.smooth();
};
}

initCanvas();


const initHovers = () => {

  // find the center of the link element and set stuckX and stuckY
  // these are needed to set the position of the noisy circle
  const handleMouseEnter = e => {
    const navItem = e.currentTarget;
    const navItemBox = navItem.getBoundingClientRect();
    stuckX = Math.round(navItemBox.left + navItemBox.width / 2);
    stuckY = Math.round(navItemBox.top + navItemBox.height / 2);
    isStuck = true;
  };
  
  // reset isStuck on mouseLeave
  const handleMouseLeave = () => {
    isStuck = false;
  };
  
  // add event listeners to all items
  const linkItems = document.querySelectorAll(".link-1");
  linkItems.forEach(item => {
    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
  });
};

initHovers();


//Horizontal Scroll
$(document).on('scroll', function(){
    $('.design').css("right", Math.max(5 - 0.80*window.scrollY)),
        $('.development').css("left", Math.max(500 - 0.55*window.scrollY))
})



// Image Smooth Scrolling

const math = {
  lerp: (a, b, n) => {
    return (1 - n) * a + n * b;
  },
  norm: (value, min, max) => {
    return (value - min) / (max - min);
  } };


const config = {
  height: window.innerHeight,
  width: window.innerWidth };


class Smooth {
  constructor() {
    this.bindMethods();

    this.data = {
      ease: 0.1,
      current: 1,
      last: 0,
      rounded: 0 };


    this.dom = {
      el: document.querySelector('[data-scroll]'),
      content: document.querySelector('[data-scroll-content]') };


    this.rAF = null;

    this.init();
  }

  bindMethods() {
    ['scroll', 'run', 'resize'].
    forEach(fn => this[fn] = this[fn].bind(this));
  }

  setStyles() {
    Object.assign(this.dom.el.style, {
      position: 'static',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      overflow: 'hidden' });

  }

  setHeight() {
    document.body.style.height = `${this.dom.content.getBoundingClientRect().height}px`;
  }

  resize() {
    this.setHeight();
    this.scroll();
  }

  preload() {
    imagesLoaded(this.dom.content, instance => {
      this.setHeight();
    });
  }

  scroll() {
    this.data.current = window.scrollY;
  }

  run() {
    this.data.last += (this.data.current - this.data.last) * this.data.ease;
    this.data.rounded = Math.round(this.data.last * 100) / 100;

    const diff = this.data.current - this.data.rounded;
    const acc = diff / config.width;
    const velo = +acc;
    const skew = velo * 7.5;

    this.dom.content.style.transform = `translate3d(0, -${this.data.rounded}px, 0) skewY(${skew}deg)`;

    this.requestAnimationFrame();
  }

  on() {
    this.setStyles();
    this.setHeight();
    this.addEvents();

    this.requestAnimationFrame();
  }

  off() {
    this.cancelAnimationFrame();

    this.removeEvents();
  }

  requestAnimationFrame() {
    this.rAF = requestAnimationFrame(this.run);
  }

  cancelAnimationFrame() {
    cancelAnimationFrame(this.rAF);
  }

  destroy() {
    document.body.style.height = '';

    this.data = null;

    this.removeEvents();
    this.cancelAnimationFrame();
  }

  resize() {
    this.setHeight();
    this.data.rounded = this.data.last = this.data.current;
  }

  addEvents() {
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('scroll', this.scroll, { passive: true });
  }

  removeEvents() {
    window.removeEventListener('resize', this.resize, { passive: true });
    window.removeEventListener('scroll', this.scroll, { passive: true });
  }

  init() {
    this.preload();
    this.on();
  }}


new Smooth();