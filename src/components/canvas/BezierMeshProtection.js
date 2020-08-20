
namespace MeshDemo {
  
    console.clear();
    const log = console.log.bind(console);
      
    const URL = window.URL;
    const baseURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/";
      
    enum GridType { Bezier, Linear }
    enum PointType { Grid, Anchor, Control }
    enum Animation { Box, Circle, Point, Random }
  
    enum Action { 
      DragStarted, 
      TextureLoaded,
      TextureChanged,
      ScreenResized, 
      GridTypeChanged, 
      GridSizeChanged,
      HandleLinkChanged
     }
    
    const pi  = Math.PI;
    const rad = pi / 180;
    const deg = 180 / pi;
    const tau = 2 * pi;
    const arc = 0.551915024494;
    const quart = pi / 4;
    const epsilon = 1e-6;   
    const URL = window.URL;
    
    TweenLite.lagSmoothing(0);
    
    function bootstrap() {
      
      angular
        .module("app", ["ngMaterial", "ngFileUpload"])
        .run(runLoader)
        .config(configureTheme)
        .controller("MainController", MainController)
        .factory("gridHandle", gridHandle)
        .service("animator", Animator)
        .service("bezierGrid", BezierGrid)
        .service("fileService", FileService)
        .service("grid", Grid)
        .service("scene", Scene)
        .service("linearGrid", LinearGrid)
        .value("loader", new PIXI.loaders.Loader(baseURL))
        .value("options", options)
        .value("pointStyles", pointStyles)
        .value("textures", {})
  
      angular.element(document).ready(() => {
        angular.bootstrap(document, ["app"]);
      });   
    }
    
    var options = {
      space: 200,
      padding: 100,
      strokeColor: 0x00aff0,
      lineColor: 0xcccccc,
      lineAlpha: 0.2,
      ease2: Expo.easeOut,
      ease1: Sine.easeOut,    
      duration: 0.75,
      gridSize: 16,
      background: 0x111111,
    };
      
    var gridStyle = {
      type: PointType.Grid,
      inner: {
        scale: 0.2,
        alpha: 0.15,
        tint: 0xffffff,
      },
      outer: {
        scale: 1,
        alpha: 0,
        tint: 0x00ff00
      }
    };
    
    var anchorStyle = {
      type: PointType.Anchor,
      inner: {
        scale: 0.35,
        alpha: 1,
        tint: options.strokeColor
      },
      outer: {
        scale: 0.5,
        alpha: 0.2,
        tint: 0x0000ff
      },
      animation: {
        scale: 0.35,
        alpha: 1,
      }
    };
    
    var controlStyle = {
      type: PointType.Control,
      inner: {
        scale: 0.35,
        alpha: 1,
        tint: options.strokeColor
      },
      outer: {
        scale: 0.5,
        alpha: 0.2,
        tint: 0xff0000
      },
      animation: {
        scale: 0.35,
        alpha: 1,
      }
    };
      
    var pointStyles = {
      grid: gridStyle,
      anchor: anchorStyle,
      control: controlStyle
    };
    
    //
    // FILE SERVICE
    // =========================================================================== 
    class FileService {
      
      constructor(public $q, public $timeout, public $rootScope) {
        
      }
      
      handleFile(file) {      
        var deferred = this.$q.defer();      
        var img = this.getImage(deferred);
        img.src = URL.createObjectURL(file);      
        return deferred.promise;
      }
      
      getImage(deferred) {
        
        var img = new Image();      
        img.onload = this.onLoad(img, deferred);
        img.onerror = this.onError(img, deferred);      
        return img;
      }
      
      onLoad(img, deferred) {
        return this.$timeout(() => {
          deferred.resolve(img.src);
          URL.revokeObjectURL(img.src);
        });
      }
      
      onError(img, deferred) {
        return this.$timeout(() => {
          deferred.reject("");
        });
      }    
    }
    
    //
    // MAIN CONTROLLER
    // =========================================================================== 
    class MainController {
              
      constructor(      
        public $http,      
        public $scope, 
        public $timeout,
        public fileService,
        public Upload,
        public scene, 
        public textures, 
        public animator) {
          
        $scope.$on(Action.TextureLoaded, () => {        
          scene.init();
          $timeout(() => {
            animator.pointAnimation();          
            $timeout(() => {
              TweenLite.to(scene.stage, 1, { alpha: 1 })
              animator.boxAnimation();
            }, 200);          
          });
        });    
      }
    
      get gridSize() { return this.scene.size - 1; }
      set gridSize(size) { this.scene.size = size + 1; }
    }
     
    //
    // POINT
    // =========================================================================== 
    class Point {
  
      constructor(public x = 0, public y = 0) {
        
      }
      
      static fromBezier(bezier, t) {
        
        var a = bezier[0];
        var b = bezier[1];
        var c = bezier[2];
        var d = bezier[3];
        
        var ab = Point.lerp(a, b, t);
        var bc = Point.lerp(b, c, t);
        var cd = Point.lerp(c, d, t);
        
        ab.lerp(bc, t);
        bc.lerp(cd, t);
        
        return ab.lerp(bc, t);
      }
      
      static centroid(points) {
        
        var point = new Point();
        var total = points.length;
  
        if (total === 1) {
          return point.copy(points[0]);
        }
  
        for (var i = 0; i < total; i++) {
          Point.add(point, points[i]);
        }
        
        return point;
      }
      
      static lerp(point1, point2, t) {
        var x = point1.x + (point2.x - point1.x) * t;
        var y = point1.y + (point2.y - point1.y) * t;
        return new Point(x, y);
      }
  
      static copy(point) {
        return new Point(point.x, point.y);
      }
  
      static equals(point1, point2) {
        return point1.x === point2.x && point1.y === point2.y;
      }
  
      static fuzzyEquals(point1, point2, epsilon = 1e-6) {
        
        var a0 = point1.x;
        var a1 = point1.y;
        var b0 = point2.x;
        var b1 = point2.y;
        
        return (Math.abs(a0 - b0) <= epsilon * Math.max(1.0, Math.abs(a0), Math.abs(b0))
                && Math.abs(a1 - b1) <= epsilon * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
      }
      
      static add(point1, point2) {
        return new Point(point1.x + point2.x, point1.y + point2.y);
      }
  
      static subtract(point1, point2) {
        return new Point(point2.x - point1.x, point2.y - point1.y);
      }
  
      static multiply(point, scalar) {
        return new Point(point.x * scalar, point.y * scalar);
      }
  
      static divide(point, scalar) {
        return new Point(point.x / scalar, point.y / scalar);
      }
  
      static fromPoints(point1, point2) {
        return new Point(point2.x - point1.x, point2.y - point1.y);
      }
  
      static negate(point) {
        return new Point(-point.x, -point.y);
      }
      
      static normalize(point) {
        
        var x = point.x;
        var y = point.y;
        
        var len = x * x + y * y;
        
        if (len > 0) {
          
          len = 1 / Math.sqrt(len);        
          point.x = point.x * len;
          point.y = point.y * len;       
        }
        
        return point;      
      }
      
      static parse(obj, xProp = "x", yProp = "y") {
        var point = new Point();
        if (obj[xProp]) point.x = parseInt(obj[xProp], 10);
        if (obj[yProp]) point.y = parseInt(obj[yProp], 10);
        return point;
      }
      
      static mid(point1, point2) {
        var x = (point1.x + point2.x) / 2;
        var y = (point1.y + point2.y) / 2;
        return new Point(x, y);
      }
      
      add(point) {
        this.x += point.x;
        this.y += point.y;
        return this;
      }
      
      // Horizontal angle
      angle() {
        var angle = Math.atan2(this.y, this.x);      
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
      }
      
      ceil() {
        this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
      }
      
      clone() {
        return new Point(this.x, this.y);
      }
      
      copy(point) {      
        return this.set(point.x, point.y);
      }
  
      copyTo(point) {
        point.x = this.x;
        point.y = this.y;
        return point;
      }
      
      floor() {
        this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
      }
  
      subtract(point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
      }
  
      multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
      }
  
      divide(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
      }    
  
      cross(point) {
        return this.x * point.y - this.y * point.x;
      }
  
      dot(point) {
        return this.x * point.x + this.y * point.y;
      }
  
      distance(point) {
        var dx = this.x - point.x;
        var dy = this.y - point.y;
        return Math.sqrt(dx * dx + dy * dy);
      }
  
      distanceSq(point) {
        var dx = this.x - point.x;
        var dy = this.y - point.y;
        return dx * dx + dy * dy;
      }
  
      inverse() {
        this.x = 1 / this.x;
        this.y = 1 / this.y;
        return this;
      }
      
      invert() {
        return this.set(this.y, this.x);
      }
      
      isZero() {
        return this.x === 0 && this.y === 0;
      }
      
      length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
      
      lengthSq() {
        return this.x * this.x + this.y * this.y;
      }
      
      lerp(point, t) {      
        this.x += (point.x - this.x) * t;
        this.y += (point.y - this.y) * t;
        return this;
      }   
  
      min(point) {      
        this.x = Math.min(this.x, point.x);
        this.y = Math.min(this.y, point.y);
        return this;
      }
      
      max(point) {      
        this.x = Math.max(this.x, point.x);
        this.y = Math.max(this.y, point.y);
        return this;
      }
      
      negate() {      
        this.x = -this.x;
        this.y = -this.y;
        return this;
      }
  
      normalize() {
        
        var x = this.x;
        var y = this.y;
        
        var len = x * x + y * y;
        
        if (len > 0) {
          
          len = 1 / Math.sqrt(len);        
          this.x = this.x * len;
          this.y = this.y * len;       
        }
        
        return this;
      }
      
      normalRightHand() {
        return this.set(this.y * -1, this.x);
      }
  
      perp() {
        return this.set(-this.y, this.x);
      }
  
      rperp() {
        return this.set(this.y, -this.x);
      }
          
      random(scale = 1) {
        
        var r = Math.random() * 2 * Math.PI;
        
        this.x = Math.cos(r) * scale;
        this.y = Math.sin(r) * scale;
        return this;
      }
      
      resize(length) {
        return this.normalize().scale(length);
      }
      
      round() {      
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
      }
      
      rotate(center, angle, distance) {
        
        var x = this.x - center.x;
        var y = this.y - center.y;
        
        if (distance == null) {
          
          var s = Math.sin(angle);
          var c = Math.cos(angle);
          
          this.x = x * c - y * s + center.x;
          this.y = x * s + y * c + center.y;
          
        } else {
          
          var t = angle + Math.atan2(y, x);
          this.x = center.x + distance * Math.cos(t);
          this.y = center.y + distance * Math.sin(t);        
        }
        
        return this;
      }
      
      scale(scalar) {      
        this.x *= scalar;
        this.y *= scalar;
        return this;
      }
      
      scaleAndAdd(point, scalar) {      
        this.x += (point.x * scalar);
        this.y += (point.y * scalar);
        return this;
      }
      
      set(x, y) {      
        this.x = x || 0;
        this.y = y || ((y !== 0) ? x : 0);      
        return this;
      }
      
      transformMatrix(m) {
        
        var x = this.x;
        var y = this.y;
        
        this.x = (m.a * x) + (m.c * y) + m.tx;
        this.y = (m.b * x) + (m.d * y) + m.ty;      
        return this;
      }
      
      verticalAngle() {
        return Math.atan2(this.x, this.y);
      }
      
      zero() {
        this.x = this.y = 0;
        return this;
      }
    }
    
    //
    // OBSERVABLE POINT
    // ===========================================================================
    class ObservablePoint extends PIXI.ObservablePoint {
      
      constructor(callback, scope, x, y) {
        super(callback, scope, x, y)
      }
    }
  
    //
    // GRID POINT
    // =========================================================================== 
    class GridPoint extends ObservablePoint {
      
      type = PointType.Grid;
      config = {};
      constructor(callback, scope, x, y) {
        super(callback, scope, x, y);
      }
    }  
    
    //
    // CONTROL POINT
    // =========================================================================== 
    class ControlPoint extends GridPoint {
          
      type = PointType.Control;
  
      anchor = null;
      handle = null;
      config = {};
  
      constructor(callback, scope, x, y) {
        super(callback, scope, x, y);
      }
  
      moveHandle(position) {
        
        this.handle.copy(Point.add(this.anchor, Point.subtract(position, this.anchor)));
        this.copy(position);
      }
    }  
  
    //
    // ANCHOR POINT
    // =========================================================================== 
    class AnchorPoint extends GridPoint {
      
      type = PointType.Anchor;
      
      cp0 = null;
      cp1 = null;
      last = new Point();
  
      config = {};
      
      constructor(callback, scope, x, y) {
        super(callback, scope, x, y);      
        this.last.copy(this);
      }
  
      addControlPoints(cp0, cp1) {
        
        this.cp0 = cp0;
        this.cp1 = cp1;    
        
        cp0.handle = cp1;
        cp1.handle = cp0;
        cp0.anchor = this;
        cp1.anchor = this;
        
        this.last.copy(this);
        this.moveHandles(this);
      }
  
      update() {
        this.last.copy(this);
        this.moveHandles(this);
      }
  
      moveHandles(position) {
              
        var last  = this.last;
        var delta = Point.subtract(last, position);
              
        this.cp0.copy(Point.add(this.cp0, delta));
        this.cp1.copy(Point.add(this.cp1, delta));
              
        last.copy(position);
        this.copy(position);
      }
    }
    
    //
    // ANIMATOR
    // ===========================================================================
    class Animator {
      
      scene = null;
      grid  = null;
      
      mesh= null;
      
      animation = new TimelineMax();
      animationType = null;
  
      constructor(public $rootScope, public options) {
              
        $rootScope.$on(Action.DragStarted, () => this.killAnimations());
        $rootScope.$on(Action.ScreenResized, () => this.restartAnimation());
        $rootScope.$on(Action.GridSizeChanged, () => this.restartAnimation());      
        $rootScope.$on(Action.HandleLinkChanged, () => this.killAnimations(true));
      }
      
      restartAnimation() {
        
        var type = this.animationType;
        var progress = this.animation.progress() || 0;
  
        if (type != null) {
  
          if (type === Animation.Random) {
            this.randomAnimation();
          } else if (progress < 1) {
  
            this.killAnimations();
  
            if (type === Animation.Box) this.boxAnimation(progress);
            if (type === Animation.Point) this.pointAnimation(progress);
            if (type === Animation.Circle) this.circleAnimation(progress);
  
            this.animation.progress(progress);
          }         
        }      
      }
  
      addScene(scene) {
        this.scene = scene;
        this.grid = scene.grid;
        this.mesh = scene.meshPlane;
      }
  
      killAnimations(restartRandom) {
        
        var type = this.animationType;      
        var bez  = this.grid.bezierGrid;
        
        this.animationType = null;
        this.animation.clear();
        TweenMax.killTweensOf([bez.anchors, bez.cps]);
        
        if (restartRandom && type === Animation.Random) {
          this.randomAnimation();
        }
      }
  
      randomPosition(point, axis, handle) {
        
        if (this.animationType !== Animation.Random) return;
                  
        var bounds = this.scene.bounds;
        var letter = _.toUpper(axis);      
        var min = bounds["min" + letter];
        var max = bounds["max" + letter];
        
        var tween = TweenLite.to(point, _.random(5, 15, true), {
          [axis]: _.random(min, max, true),
          ease: Sine.easeInOut,
          onComplete: () => {
            if (this.animationType === Animation.Random) {
              this.randomPosition(point, axis, handle);
            }          
          }        
        });
        
        if (handle) {
          tween.vars.onUpdate = () => point.moveHandle(point);
        }      
      }
  
      randomAnimation() {
        
        this.animation.clear();
        this.animationType = Animation.Random;
        
        var anchors = this.grid.bezierGrid.anchors;
        
        anchors.forEach((anchor, index) => {
                  
          var cp0 = anchor.cp0;
          var cp1 = anchor.cp1;
          
          var handle;
          if (this.scene.handlesLocked) handle = cp1;
          
          anchor.update();
          this.randomPosition(anchor, "x");
          this.randomPosition(anchor, "y");
          
          this.randomPosition(cp0, "x", handle);
          this.randomPosition(cp0, "y", handle);
                  
          if (!handle) {                    
            this.randomPosition(cp1, "x");
            this.randomPosition(cp1, "y");                    
          }       
        });            
      }
  
      circleAnimation() {
              
        this.animation.clear();
        this.animationType = Animation.Circle;
        
        var grid = this.grid;
        var bez  = grid.bezierGrid;
        
        var t1 = this.options.duration;
        var t2 = this.options.duration;
        
        var e1 = this.options.ease1;
        var e2 = this.options.ease2;
        
        var bounds = this.scene.bounds;
        var center = bounds.center;
        var radius = bounds.radius;
        var length = radius * arc;
              
        var p1 = new Point(center.x, center.y - radius).rotate(center, -quart);
        var p2 = new Point(center.x + radius, center.y).rotate(center, -quart);
        var p3 = new Point(center.x - radius, center.y).rotate(center, -quart);
        var p4 = new Point(center.x, center.y + radius).rotate(center, -quart);
        
        // TL
        var cpT0 = new Point(p1.x, p1.y - length).rotate(p1, quart);
        var cpL0 = Point.add(p1, Point.subtract(cpT0, p1));
        
        // TR
        var cpT1 = new Point(p2.x, p2.y - length).rotate(p2, -quart);
        var cpR0 = Point.add(p2, Point.subtract(cpT1, p2));
        
        // BL
        var cpL1 = new Point(p3.x, p3.y - length).rotate(p3, -quart);
        var cpB0 = Point.add(p3, Point.subtract(cpL1, p3));
        
        // BR
        var cpR1 = new Point(p4.x, p4.y - length).rotate(p4, quart);
        var cpB1 = Point.add(p4, Point.subtract(cpR1, p4));
        
        this.animation
          .to(grid.tl, t1, { x: p1.x, y: p1.y, ease: e1 }, 0)      
          .to(grid.tr, t1, { x: p2.x, y: p2.y, ease: e1 }, 0)
          .to(grid.bl, t1, { x: p3.x, y: p3.y, ease: e1 }, 0)
          .to(grid.br, t1, { x: p4.x, y: p4.y, ease: e1 }, 0)
              
        this.animation
          .to(bez.cpT0, t2, { x: cpT0.x, y: cpT0.y, ease: e2 }, 0)
          .to(bez.cpT1, t2, { x: cpT1.x, y: cpT1.y, ease: e2 }, 0)
          .to(bez.cpB0, t2, { x: cpB0.x, y: cpB0.y, ease: e2 }, 0)
          .to(bez.cpB1, t2, { x: cpB1.x, y: cpB1.y, ease: e2 }, 0)
          .to(bez.cpL0, t2, { x: cpL0.x, y: cpL0.y, ease: e2 }, 0)
          .to(bez.cpL1, t2, { x: cpL1.x, y: cpL1.y, ease: e2 }, 0)
          .to(bez.cpR0, t2, { x: cpR0.x, y: cpR0.y, ease: e2 }, 0)
          .to(bez.cpR1, t2, { x: cpR1.x, y: cpR1.y, ease: e2 }, 0); 
      }
  
      pointAnimation() {
        
        this.animation.clear();
        this.animationType = Animation.Point;
        
        var grid = this.grid;
        var bez  = grid.bezierGrid;
        
        var t1 = this.options.duration;
        var t2 = this.options.duration;
        
        var e1 = this.options.ease1;
        var e2 = this.options.ease2;
        
        var e2 = this.options.ease1;
        var e1 = this.options.ease2;
        
        var bounds = this.scene.bounds;
        
        this.animation
          .to(grid.tl, t1, { x: bounds.cx, y: bounds.cy, ease: e1 }, 0)
          .to(grid.tr, t1, { x: bounds.cx, y: bounds.cy, ease: e1 }, 0)
          .to(grid.bl, t1, { x: bounds.cx, y: bounds.cy, ease: e1 }, 0)
          .to(grid.br, t1, { x: bounds.cx, y: bounds.cy, ease: e1 }, 0)
        
        this.animation
          .to(bez.cpT0, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpT1, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpB0, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpB1, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpL0, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpL1, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpR0, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0)
          .to(bez.cpR1, t2, { x: bounds.cx, y: bounds.cy, ease: e2 }, 0);      
      }
  
      boxAnimation() {
        
        this.animation.clear();
        this.animationType = Animation.Box;
              
        var grid = this.grid;
        var bez  = grid.bezierGrid;
        
        var t1 = this.options.duration;
        var t2 = this.options.duration;
        
        var e1 = this.options.ease1;
        var e2 = this.options.ease2;
        
        var bounds = this.scene.bounds;       
        
        this.animation
          .to(grid.tl, t1, { x: bounds.x0, y: bounds.y0, ease: e1 }, 0)
          .to(grid.tr, t1, { x: bounds.x3, y: bounds.y0, ease: e1 }, 0)
          .to(grid.bl, t1, { x: bounds.x0, y: bounds.y3, ease: e1 }, 0)
          .to(grid.br, t1, { x: bounds.x3, y: bounds.y3, ease: e1 }, 0)
              
        this.animation
          .to(bez.cpT0, t2, { x: bounds.x1, y: bounds.y0, ease: e2 }, 0)
          .to(bez.cpT1, t2, { x: bounds.x2, y: bounds.y0, ease: e2 }, 0)
          .to(bez.cpB0, t2, { x: bounds.x1, y: bounds.y3, ease: e2 }, 0)
          .to(bez.cpB1, t2, { x: bounds.x2, y: bounds.y3, ease: e2 }, 0)
          .to(bez.cpL0, t2, { x: bounds.x0, y: bounds.y1, ease: e2 }, 0)
          .to(bez.cpL1, t2, { x: bounds.x0, y: bounds.y2, ease: e2 }, 0)
          .to(bez.cpR0, t2, { x: bounds.x3, y: bounds.y1, ease: e2 }, 0)
          .to(bez.cpR1, t2, { x: bounds.x3, y: bounds.y2, ease: e2 }, 0)
      }
    }
    
    //
    // MESH PLANE
    // ===========================================================================  
    class MeshPlane {
  
      mesh = null;
      texture = null;
  
      scale = 1;
      size  = 0;
  
      width  = 0;
      height = 0;
  
      baseWidth  = 0;
      baseHeight = 0;
  
      space = this.options.space;
  
      container = new PIXI.Container();
  
      constructor(public scene, public options) {      
        
      }
      
      init(texture, size) {
        
        this.texture = texture;
        
        this.size = size;
        this.mesh = new PIXI.mesh.Plane(texture, size, size);
        this.container.addChild(this.mesh);
        
        this.baseWidth  = texture.width;
        this.baseHeight = texture.height;
        
        this.resize();
      }
  
      setVertices(x, y) {
        this.container.removeChild(this.mesh);
        this.mesh.destroy();
        this.init(this.texture, x);
      }
  
      resize() {
                    
        var w1 = this.scene.width;
        var h1 = this.scene.height;     
        
        var w2 = this.baseWidth;
        var h2 = this.baseHeight;
        
        var ratio = Math.min((w1 - this.space) / w2, (h1 - this.space) / h2);
        
        w2 *= ratio;
        h2 *= ratio;
        
        var x = w1 / 2 - w2 / 2;
        var y = h1 / 2 - h2 / 2;
              
        this.width  = w2;
        this.height = h2;      
        this.scale  = ratio;
              
        this.container.position.set(x, y);
        this.scene.grid.container.position.set(x, y);      
        this.scene.bounds.set(x, y, w2, h2);
                    
        // Horribly unoptimized way of doing the resize
        this.scene.grid.init(this.scene, this.width, this.height, this.size, this.scale);      
      }
    }
    
    //
    // BOUNDS
    // ===========================================================================
    class Bounds {
          
      x0 = 0;
      x1 = 0;
      x2 = 0;
      x3 = 0;
  
      y0 = 0;
      y1 = 0;
      y2 = 0;
      y3 = 0;
      
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
  
      padding = 10;
      radius  = 0;    
      center  = new Point();
      
      constructor(public x = 0, public y = 0, public width = 0, public height = 0) {      
        this.update();      
      }
  
      get cx() { return this.center.x; }
      get cy() { return this.center.y; }
  
      update() {
                 
        var x = this.x;
        var y = this.y;
        var w = this.width;
        var h = this.height;      
        
        var cx = w / 2;
        var cy = h / 2;
        
        var pad = this.padding;
        
        this.x0 = 0;
        this.x1 = w * 1/3;
        this.x2 = w * 2/3;
        this.x3 = w;
        
        this.y0 = 0;
        this.y1 = h * 1/3;
        this.y2 = h * 2/3;
        this.y3 = h;
        
        this.minX = -x + pad;
        this.minY = -y + pad;
        this.maxX =  w + x - pad;
        this.maxY =  h + y - pad;
        
        this.width  = w;
        this.height = h;
        
        this.center.set(cx, cy);
        this.radius = Math.min(cx, cy);
      }
  
      set(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width  = width;
        this.height = height;
        this.update();
      }
    }
    
    //
    // SCENE
    // ===========================================================================
    class Scene {
      
      _size = 1;
      _handlesLocked = true;
      
      dragging = null; 
      meshPlane = new MeshPlane(this, this.options);
      sizeChanged = false;    
          
      resources  = {};
      $container = null;
  
      renderer = PIXI.autoDetectRenderer(this.width, this.height, {
        // resolution: window.devicePixelRatio || 1,
        backgroundColor: this.options.background,
        antialias: true
      });
      
      bounds = new Bounds();
      stage  = new PIXI.Container();
  
      gridContainer  = new PIXI.Container();
      planeContainer = new PIXI.Container();
  
      debouncedSizeChange   = _.throttle(() => { this.sizeChanged = true }, 33);
      debouncedResizeChange = _.debounce(() => { this.resized = true }, 33);
  
      ready = false;
  
      constructor(
        public $rootScope, 
        public $timeout, 
        public grid, 
        public options,
        public textures, 
        public pointStyles, 
        public animator) {
             
        this.stage.alpha = 0;
        
        textures.outerPointTexture = createPointTexture(this.renderer, 20, [0x00ff00, 0.1], [0]);
        textures.innerPointTexture = createPointTexture(this.renderer, 10, [0xffffff, 1], [1, 0x111111, 1]);
          
        _.forOwn(pointStyles, style => {
          style.inner.texture = textures.innerPointTexture;
          style.outer.texture = textures.outerPointTexture;
        });      
      }
  
      get handlesLocked() { return this._handlesLocked; }
      set handlesLocked(value) {
        
        this._handlesLocked = value;
        this.$rootScope.$broadcast(Action.HandleLinkChanged, value);
      }
  
      get size() { return this.meshPlane.size; }
      set size(size) {
        this._size = size;
        this.debouncedSizeChange();
      }
  
      get bezierGrid() { return this.grid.type === GridType.Bezier; }
      set bezierGrid(value) {
        this.grid.changeGridType(value ? GridType.Bezier : GridType.Linear);
      }
    
      init(resources) {
         
        var gridSize = this.options.gridSize;
        
        this.bounds.padding = this.options.padding;
        
        this.$container = angular.element("#canvas-container");
        this.$container.append(this.renderer.view);
        
        this.resources  = this.textures;
        var gsapTexture = this.textures.gsap.texture;
        
        this.textures.pointTexture = this.pointTexture;
              
        this.width  = this.$container.width();
        this.height = this.$container.height();      
        
        this.meshPlane.init(gsapTexture, gridSize, gridSize);      
        this._size = this.meshPlane.size;
        
        this.stage.addChild(this.meshPlane.container);
        this.plane = this.meshPlane.mesh;
        
        this.stage.addChild(this.grid.container);      
        this.animator.addScene(this);
              
        this.resize();
        // window.addEventListener("resize", () => this.resize());
        // TweenLite.ticker.addEventListener("tick", this.render, this);
              
        if (!this.ready) {
          window.addEventListener("resize", () => this.resize());
          TweenLite.ticker.addEventListener("tick", this.render, this);
          // requestAnimationFrame(this.render);
          this.ready = true;
        }
        
        this.$timeout();
      }
      
      // render() {
      render = () => {
              
        if (this.sizeChanged) {
          this.meshPlane.setVertices(this._size, this._size);
          this.dragging = null;
          this.sizeChanged = false;        
          this.$rootScope.$broadcast(Action.GridSizeChanged);
        }
        
        this.grid.update();
        
        this.renderer.render(this.stage);      
        // requestAnimationFrame(this.render);
      }
  
      resize() {
        
        this.width  = this.$container.width();
        this.height = this.$container.height();
              
        this.meshPlane.resize();      
        this.renderer.resize(this.width, this.height);      
        this.$rootScope.$broadcast(Action.ScreenResized);
      }
    }
    
    
    //
    // GRID HANDLE
    // ===========================================================================  
    function gridHandle($rootScope) {    
      return {
        create: (scene, config) => new HandleSprites($rootScope, scene, config)
      };
    }
  
    // Should probably extend a DisplayObject instead
    class HandleSprites {
      
      // animation = new TimelineLite({ 
      //   paused: true, 
      //   callbackScope: this 
      // });
      
      container = new PIXI.Container();    
      config = this.point.config;
  
      outerSprite = new PIXI.Sprite(this.point.config.outer.texture);
      innerSprite = new PIXI.Sprite(this.point.config.inner.texture);
  
      position = new ObservablePoint(this.updatePosition, this);
  
      constructor(public $rootScope, public scene, public point) {
        
        var scale  = scene.grid.scale;      
        var config = point.config;
        
        this.container.addChild(this.innerSprite);
        this.container.addChild(this.outerSprite);
        
        this.position.copy(point);
        
        this.innerSprite.anchor.set(0.5);
        this.outerSprite.anchor.set(0.5);
        
        this.outerSprite.interactive = true;
        this.outerSprite.buttonMode  = true;
        
        TweenLite.set(this.innerSprite, { pixi: _.pick(config.inner, ["alpha", "scale"]) });
        TweenLite.set(this.outerSprite, { pixi: _.pick(config.outer, ["alpha", "scale"]) })
        
        this.innerSprite.tint = config.inner.tint;
        this.outerSprite.tint = config.outer.tint;
        
        // if (config.animation) {
        //   this.animation.to(this.innerSprite, 0.15, { pixi: config.animation });
        // }
              
        var events = [
          [this.onDragStart, "mousedown,touchstart"],
          [this.onDragMove,  "mousemove,touchmove"],
          [this.onDragEnd,   "mouseup,mouseupoutside,touchend,touchendoutside"],
          // [this.onMouseOver, "mouseover"],
          // [this.onMouseOut,  "mouseout"]
        ];
        
        events.forEach(event => this.bindEvents(this.outerSprite, event[1], event[0]));     
      }
  
      get x() { return this.position.x; }
      get y() { return this.position.y; }
  
      set x(x) { this.position.x = x; }
      set y(y) { this.position.x = y; }
  
      updatePosition() {
        this.innerSprite.position.copy(this.position);
        this.outerSprite.position.copy(this.position);      
      }
  
      onMouseOver = event => {      
        if (!this.scene.dragging) {
          // this.animation.play().timeScale(1);
        }      
      }
      
      onMouseOut = event => {      
        if (this.scene.dragging != this) {
          // this.animation.reverse().timeScale(0.25);
        }      
      }
      
      onDragStart = (event) => {
        
        this.data = event.data;
        this.dragging = true;      
        this.scene.dragging = this;
        
        this.$rootScope.$broadcast(Action.DragStarted);
        
        if (this.point.type === PointType.Anchor) {
          point.update();    
        }
      }
      
      onDragEnd = event => {
        this.data = null;
        this.dragging = false;      
        this.scene.dragging = false;
      }
      
      onDragMove = event => {
              
        if (this.dragging) {
          
          var position = Point.copy(this.data.getLocalPosition(this.container));
          
          if (this.scene.handlesLocked) {
            
            if (this.point.type === PointType.Anchor) {             
              this.point.moveHandles(position);   
            } else if (this.point.type === PointType.Control) {   
              this.point.moveHandle(position);
            }
          }
          
          this.point.copy(position);     
        }      
      }
      
      bindEvents(target, events, handler) {
        events.split(",").forEach(event => {
          target.on(event, handler);
        });
      }
  
      destroy() {
        // this.animation.kill();
        this.innerSprite.destroy();
        this.outerSprite.destroy();
        this.container.destroy();
      }
    }
  
    //
    // BEZIER GRID
    // ===========================================================================
    class BezierGrid {
         
      tl = null;
      tr = null;
      br = null;
      bl = null;
  
      cps = null;
  
      cpT0 = null;
      cpT1 = null;  
      cpB0 = null;
      cpB1 = null;  
      cpL0 = null;
      cpL1 = null;
      cpR0 = null;
      cpR1 = null;  
    
      bezierT = null;
      bezierB = null;
      bezierL = null;
      bezierR = null; 
      
      anchors = null;
      beziers = [];
      handles = [];
      
      container = new PIXI.Container();
      graphics  = new PIXI.Graphics();
      
      scale = 1;
  
      constructor(public options, public textures, public gridHandle, public pointStyles) {      
        
      }
      
      init(grid, beziers) {
        
        this.reset();
        
        this.grid = grid;
        
        this.scale = grid.scale;
        
        this.tl = grid.tl;
        this.tr = grid.tr;
        this.br = grid.br;
        this.bl = grid.bl;
        
        this.container.addChild(this.graphics);
        this.createGrid(beziers);
      }
  
      reset() {
              
        this.beziers = null;
        this.anchors = null;
        this.cps = null;      
        
        this.container.removeChildren();
        this.graphics.clear();
      }
  
      createGrid(beziers) {
              
        var pointTexture = this.textures.pointTexture;
        
        var onUpdate = _.partial(this.grid.pointChanged, 0, true, false, true);
        
        var min = 0.15;
        var mid = 0.85;
        var max = 1.15;
        
        var width  = this.grid.width;
        var height = this.grid.height;
        var scope  = this.grid;
                  
        // Top
        this.cpT0 = new ControlPoint(onUpdate, scope, width * min, -height * min);
        this.cpT1 = new ControlPoint(onUpdate, scope, width * mid, -height * min);
        
        // Bottom
        this.cpB0 = new ControlPoint(onUpdate, scope, width * min, height * max);
        this.cpB1 = new ControlPoint(onUpdate, scope, width * mid, height * max); 
        
        // Left
        this.cpL0 = new ControlPoint(onUpdate, scope, -width * min, height * min);
        this.cpL1 = new ControlPoint(onUpdate, scope, -width * min, height * mid);
        
        // Right
        this.cpR0 = new ControlPoint(onUpdate, scope, width * max, height * min);
        this.cpR1 = new ControlPoint(onUpdate, scope, width * max, height * mid);
             
        this.bezierT = [this.tl, this.cpT0, this.cpT1, this.tr];
        this.bezierB = [this.bl, this.cpB0, this.cpB1, this.br];
        this.bezierL = [this.tl, this.cpL0, this.cpL1, this.bl];
        this.bezierR = [this.tr, this.cpR0, this.cpR1, this.br];
        
        var startValues = [this.bezierT, this.bezierB, this.bezierL, this.bezierR];
        
        if (beziers.length) {
          
          beziers.forEach((bezier, i) => {                 
            bezier.forEach((point, j) => {
              startValues[i][j].copy(Point.multiply(point, this.scale));  
            });
          });        
        } 
              
        this.beziers = startValues;
              
        this.cps = [
          this.cpL0, this.cpL1, this.cpR0, this.cpR1,
          this.cpT0, this.cpT1, this.cpB0, this.cpB1
        ];
        
        this.anchors = [
          this.tl, this.bl, this.tr, this.br,
          this.tl, this.tr, this.bl, this.br        
        ];     
        
        this.tl.addControlPoints(this.cpT0, this.cpL0);
        this.tr.addControlPoints(this.cpT1, this.cpR0);
        this.bl.addControlPoints(this.cpB0, this.cpL1);
        this.br.addControlPoints(this.cpB1, this.cpR1);
                  
        this.handles = this.cps.map((cp, i) => {
                  
          _.assign(cp.config, this.pointStyles.control);
          
          var handle = this.gridHandle.create(this.grid.scene, cp);
          
          this.container.addChild(handle.container);
          
          return handle;
        });    
      }
    
      update(updateGrid) {
        
        if (updateGrid) {
          
          var q, i, ix, iy, x, y;
                     
          var rows = this.grid.size;
          var cols = this.grid.size;
          
          for (iy = 0; iy < rows; iy++) {
  
            y = iy / (rows - 1);
  
            var yl = Point.fromBezier(this.bezierL, y);
            var yr = Point.fromBezier(this.bezierR, y);
  
            var cp0 = Point.lerp(this.cpT0, this.cpB0, y);
            var cp1 = Point.lerp(this.cpT1, this.cpB1, y);
  
            for (ix = 0; ix < cols; ix++) {
  
              i = ix + iy * cols;
              q = this.grid.points[i];
              x = ix / (cols - 1);
  
              var k = Point.fromBezier([yl, cp0, cp1, yr], x);                   
              var h = this.grid.handles[i];
              
              h.position.copy(k);
              q.copy(k);          
            }
          }
  
          for (i = 0; i < 8; i++) {
  
            var cp = this.cps[i];
            var handle = this.handles[i];
  
            handle.position.copy(cp);
          }       
        }    
        
        this.draw();
      }
    
      draw() {
        
        var color = this.options.strokeColor;      
        var graphics = this.graphics;
        
        graphics.clear();
        graphics.lineStyle(1, color, 1);
        
        for (var i = 0; i < 8; i++) {
          
          var cp = this.cps[i];
          var anchor = this.anchors[i];
          
          graphics.moveTo(cp.x, cp.y);
          graphics.lineTo(anchor.x, anchor.y);        
        }
      }
    }
      
    //
    // LINEAR GRID
    // ===========================================================================
    class LinearGrid {
      
      points  = [];
      handles = [];
      
      container = new PIXI.Container();
  
      tl = null;
      tr = null;
      bl = null;
      br = null;
  
      scale = 1;
  
      constructor(public textures, public gridHandle, public pointStyles) {
        
      }
  
      init(grid) {
        
        this.reset();
        
        this.grid  = grid;      
        this.scale = grid.scale;
        
        this.createGrid();
      }
  
      reset() {
        
        this.points.forEach(point => point = null);
        this.handles.forEach(handle => handle.destroy())
        this.points.length  = 0;
        this.handles.length = 0;
  
        this.container.removeChildren();
  
        this.tl = null;
        this.tr = null;
        this.bl = null;
        this.br = null;      
      }
  
      createGrid() {
        
        var pointTexture = this.textures.pointTexture;
        var pointTexture = this.textures.outerPointTexture;
        var pointTexture = this.textures.innerPointTexture;
             
        var textures = [this.textures.innerPointTexture, this.textures.outerPointTexture]
        
        var rows = this.grid.size;
        var cols = this.grid.size;
        var size = this.grid.sizeSq;      
        
        var width  = this.grid.width;
        var height = this.grid.height;
              
        for(var i = 0, y = 0; y < rows; y++) {
          
          var normY = y / (rows - 1);        
          
          for(var x = 0; x < cols; i++, x++) {
            
            var normX = x / (cols - 1);
                      
            var corner = "";
            var handle;
            
            if (i === 0) corner = "tl";
            if (i === cols - 1) corner = "tr";
            if (i === size - 1) corner = "br";
            if (i === size - cols) corner = "bl";          
            
            var onUpdate = _.partial(this.grid.pointChanged, i, true, corner);
                      
            var point;
            
            if (corner) {
              
              point = new AnchorPoint(onUpdate, this.grid, normX * width, normY * height);
              point._index = i;
                      
              this[corner] = point;
              
              _.assign(point.config, this.pointStyles.anchor);
              
              handle = this.gridHandle.create(this.grid.scene, point);
              this.container.addChild(handle.container);
            } else {
              
              
              point = new GridPoint(onUpdate, this.grid, normX * width, normY * height);
              point._index = i;
                      
               _.assign(point.config, this.pointStyles.grid);
              
              handle = this.gridHandle.create(this.grid.scene, point);
              
              this.container.addChild(handle.container);
            }
            
            this.points.push(point);
            this.handles.push(handle);
          }
        }
        
        this.container.setChildIndex(this.handles[0].container, size - 1);
        this.container.setChildIndex(this.handles[cols - 1].container, size - 1);
        this.container.setChildIndex(this.handles[size - cols].container, size - 1);      
      }
  
      update() {
        
        var q, i, ix, iy, x, y;
              
        var rows = this.grid.size;
        var cols = this.grid.size;
  
        for (iy = 0; iy < rows; iy++) {
          
          y = iy / (rows - 1);
  
          var yl = Point.lerp(this.tl, this.bl, y);
          var yr = Point.lerp(this.tr, this.br, y);
  
          for (ix = 0; ix < cols; ix++) {
  
            i = ix + iy * cols;
            q = this.points[i];
            x = ix / (cols - 1);
  
            var k = Point.lerp(yl, yr, x);          
            var h = this.handles[i];
            h.position.copy(k);
            q.copy(k);
          }
        }      
      }
    }  
  
    //
    // GRID
    // ===========================================================================
    class Grid {
      
      type = GridType.Bezier;
  
      scale = 1;
      lastScale = 1;
  
      dirty = true;
      alignGrid = true;  
      
      container = new PIXI.Container();
      graphics  = new PIXI.Graphics();
  
      tl = null;
      tr = null;
      bl = null;
      br = null;
      
      points  = [];
      handles = [];    
      beziers = [];
  
      constructor(public $rootScope, public options, public linearGrid, public bezierGrid) {      
        
      }
  
      init(scene, width, height, size, scale) {
        
        this.lastScale = this.scale;
        
        this.scale = scale;
        
        this.reset();
        
        this.scene  = scene;
        this.width  = width;
        this.height = height;
        this.size   = size;
        this.sizeSq = size ** 2;
              
        this.container.addChild(this.graphics);
        this.createGrid();      
      }
  
      reset() {
            
        var currentBeziers = this.bezierGrid.beziers;
        
        this.beziers = currentBeziers.reduce((beziers, bezier) => {
          var points = [];
          bezier.forEach(point => {
            points.push(Point.copy(Point.divide(point, this.lastScale || epsilon)));
          });
          beziers.push(points);
          return beziers;        
        }, []);
        
        this.points  = null;
        this.handles = null;
        this.tl = null;
        this.tr = null;
        this.br = null;
        this.bl = null;
        
        this.container.removeChildren();
        this.graphics.clear();
      }
  
      createGrid() {
        
        this.linearGrid.init(this);
        
        this.points  = this.linearGrid.points;
        this.handles = this.linearGrid.handles;
        this.tl = this.linearGrid.tl;
        this.tr = this.linearGrid.tr;
        this.br = this.linearGrid.br;
        this.bl = this.linearGrid.bl;
                    
        this.handles.forEach((handle, i) => {        
          var point = this.points[i];        
          handle.x = point.x;
          handle.y = point.y;
          handle.updatePosition();
        });
        
        this.bezierGrid.init(this, this.beziers);
              
        this.container.addChild(this.linearGrid.container);
        this.container.addChild(this.bezierGrid.container);
        
        this.update();
        
        if (this.type == GridType.Linear) {
          this.linearGrid.update();
        } else {
          this.bezierGrid.update(true);
        }
        
        this.dirty = true;
        this.alignGrid = true;
        this.update();      
      }
  
      changeGridType(type) {
        
        this.type = type;
        
        this.bezierGrid.container.visible = !(type == GridType.Linear);
        
        this.update();
        
        if (type == GridType.Linear) {
          this.linearGrid.update();
        } else {
          this.bezierGrid.update(true);
        }
        
        this.dirty = true;
        this.alignGrid = true;
        this.update();
        
        this.$rootScope.$broadcast(Action.GridTypeChanged);
      }
  
      pointChanged(index, gridPoint, cornerPoint, controlPoint) {
        
        if (cornerPoint || controlPoint) {                
          this.alignGrid = true;
        }
        
        this.dirty = true;
      }
  
      update() {
        
        if (!this.dirty) { return this; }
              
        var size = this.points.length;      
        var plane = this.scene.meshPlane.mesh;
        var vertices = plane.vertices;
        
        for (var i = 0; i < size; i++) {
          
          var point  = this.points[i];
          var handle = this.handles[i];
          
          handle.position.copy(point);
          
          var j = i * 2;
          
          vertices[j  ] = point.x;
          vertices[j+1] = point.y;
          
        }
                    
        if (this.alignGrid) {
          
          if (this.type === GridType.Linear) {        
            this.linearGrid.update(this.alignGrid);
          } else {
            this.bezierGrid.update(this.alignGrid);
          }
          
          this.alignGrid = false;
        }
        
        this.draw();
        this.dirty = false;      
      }
  
      draw() {
        
        var p, i, ix, iy, x, y;
              
        var rows = this.size;
        var cols = this.size;
        
        var color = this.options.lineColor;
        var alpha = this.options.lineAlpha;
        
        var graphics = this.graphics;
        graphics.clear();
        graphics.lineStyle(1, color, alpha);      
        
        for (iy = 0; iy < rows; iy++) {
          for (ix = 0; ix < cols; ix++) {
            
            i = iy * cols + ix;
            p = this.points[i];
            
            x = p.x;
            y = p.y;
                
            if(ix === 0) {
              graphics.moveTo(x, y);
            }
            else {
              graphics.lineTo(x, y);
            }
          }
        }
        
        for (ix = 0; ix < cols; ix++) {
          for (iy = 0; iy < rows; iy++) {
            
            i = iy * cols + ix;
            p = this.points[i];
            
            x = p.x;
            y = p.y;
                   
            if(iy === 0) {
              graphics.moveTo(x, y);
            }
            else {
              graphics.lineTo(x, y);
            }
          }
        }
      }
    }
      
    //
    // CREATE POINT TEXTURE
    // ===========================================================================
    function createPointTexture(renderer, radius, fillStyle, lineStyle) {
      
      var graphics = new PIXI.Graphics();
          
      graphics.beginFill.apply(graphics, fillStyle || [0xffffff, 0]);
      graphics.lineStyle.apply(graphics, lineStyle || [0]);
      graphics.drawCircle(0, 0, radius);
      graphics.endFill();    
      
      var texture = renderer.generateTexture(graphics);
      graphics.destroy();
      return texture;
    }  
       
    function runLoader($rootScope, loader, textures) {
      
      loader
        .add("gsap", "gsaphero2.png")
        .load((ldr, resources) => {        
          _.assign(textures, resources);
          $rootScope.$broadcast(Action.TextureLoaded);
        });    
    }
  
    function configureTheme($mdThemingProvider) {
          
      $mdThemingProvider.theme("default")
        .dark()  
        .primaryPalette("light-blue");
    }
  
    function isEven(n) {
      return !(n & 1);
    }
    
    function isOdd(n) {
      return !!(n & 1);
    }
  
    function normalize(value, min, max) {
      return (value - min) / (max - min);
    }
  
    function map(x, a, b, c, d) {
      return c + (d - c) * ((x - a) / (b - a)) || 0;
    }
  
    function lerp(min, max, t) {
      return min + (max - min) * t;
    }
  
    bootstrap();
  }