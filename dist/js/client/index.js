(() => {
  // src/client/modules/oculus.ts
  var defaultCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.willChange = "opacity";
        entry.target.classList.add("animated");
        observer.unobserve(entry.target);
      }
    });
  };
  var defaultSelectionCallback = (selector) => {
    return document.querySelectorAll(selector);
  };
  var oculus = (selector = "[animation]", callback2 = defaultCallback, selectionCallback = defaultSelectionCallback, options = {}) => {
    const templates = selectionCallback(selector);
    if (templates.length > 0) {
      const myObserver = new IntersectionObserver(callback2, options);
      templates.forEach((entries) => {
        myObserver.observe(entries);
      });
    }
  };
  var oculus_default = oculus;

  // src/client/modules/imageFade.ts
  var callback = (entries, observer) => {
    let order = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.willChange = "opacity";
        entry.target.style.transitionDelay = order * 10 + "ms";
        entry.target.classList.add("lazy-loaded");
        observer.unobserve(entry.target);
        order++;
      }
    });
  };
  var imageFade = (selector = ".wp-block-image img, .wp-post-image", options = {}) => {
    const templates = document.querySelectorAll(selector);
    if (templates.length > 0) {
      const myObserver = new IntersectionObserver(callback, options);
      templates.forEach((entries) => {
        myObserver.observe(entries);
      });
    }
  };
  var imageFade_default = imageFade;

  // src/client/modules/scrollTracker.js
  var supportsPassive = false;
  try {
    let opts = Object.defineProperty({}, "passive", {
      get: function() {
        supportsPassive = true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (e) {
  }
  var requestFrame = window.requestAnimationFrame;
  var cancelFrame = window.cancelAnimationFrame;
  if (!requestFrame) {
    ["ms", "moz", "webkit", "o"].every(function(prefix) {
      requestFrame = window[prefix + "RequestAnimationFrame"];
      cancelFrame = window[prefix + "CancelAnimationFrame"] || window[prefix + "CancelRequestAnimationFrame"];
      return !requestFrame;
    });
  }
  var isSupported = !!requestFrame;
  var isListening = false;
  var isQueued = false;
  var isIdle = true;
  var scrollY2 = window.pageYOffset;
  var scrollX = window.pageXOffset;
  var scrollYCached = scrollY2;
  var scrollXCached = scrollX;
  var directionX = ["x", "horizontal"];
  var directionAll = ["any"];
  var callbackQueue = {
    x: [],
    y: [],
    any: []
  };
  var detectIdleTimeout;
  var tickId;
  function handleScroll() {
    let isScrollChanged = false;
    if (callbackQueue.x.length || callbackQueue.any.length) {
      scrollX = window.scrollX;
    }
    if (callbackQueue.y.length || callbackQueue.any.length) {
      scrollY2 = window.scrollY;
    }
    if (scrollY2 !== scrollYCached) {
      callbackQueue.y.forEach(triggerCallback.y);
      scrollYCached = scrollY2;
      isScrollChanged = true;
    }
    if (scrollX !== scrollXCached) {
      callbackQueue.x.forEach(triggerCallback.x);
      scrollXCached = scrollX;
      isScrollChanged = true;
    }
    if (isScrollChanged) {
      callbackQueue.any.forEach(triggerCallback.any);
      window.clearTimeout(detectIdleTimeout);
      detectIdleTimeout = null;
    }
    isQueued = false;
    requestTick();
  }
  function triggerCallback(callback2, scroll) {
    callback2(scroll);
  }
  triggerCallback.y = function(callback2) {
    triggerCallback(callback2, scrollY2);
  };
  triggerCallback.x = function(callback2) {
    triggerCallback(callback2, scrollX);
  };
  triggerCallback.any = function(callback2) {
    triggerCallback(callback2, [scrollX, scrollY2]);
  };
  function enableScrollListener() {
    if (isListening || isQueued) {
      return;
    }
    if (isIdle) {
      isListening = true;
      window.addEventListener(
        "scroll",
        onScrollDebouncer,
        supportsPassive ? { passive: true } : false
      );
      document.body.addEventListener(
        "touchmove",
        onScrollDebouncer,
        supportsPassive ? { passive: true } : false
      );
      return;
    }
    requestTick();
  }
  function disableScrollListener() {
    if (!isListening) {
      return;
    }
    window.removeEventListener("scroll", onScrollDebouncer);
    document.body.removeEventListener("touchmove", onScrollDebouncer);
    isListening = false;
  }
  function onScrollDebouncer() {
    isIdle = false;
    requestTick();
    disableScrollListener();
  }
  function requestTick() {
    if (isQueued) {
      return;
    }
    if (!detectIdleTimeout) {
      detectIdleTimeout = window.setTimeout(detectIdle, 200);
    }
    tickId = requestFrame(handleScroll);
    isQueued = true;
  }
  function cancelTick() {
    if (!isQueued) {
      return;
    }
    cancelFrame(tickId);
    isQueued = false;
  }
  function detectIdle() {
    isIdle = true;
    cancelTick();
    enableScrollListener();
  }
  function scrollTracker(direction, callback2) {
    if (!isSupported) {
      return;
    }
    enableScrollListener();
    if (typeof direction === "function") {
      callback2 = direction;
      callbackQueue.y.push(callback2);
      return;
    }
    if (typeof callback2 === "function") {
      if (~directionX.indexOf(direction)) {
        callbackQueue.x.push(callback2);
      } else if (~directionAll.indexOf(direction)) {
        callbackQueue.any.push(callback2);
      } else {
        callbackQueue.y.push(callback2);
      }
    }
  }
  scrollTracker.remove = function(direction, fn) {
    let queueKey = "y", queue, fnIdx;
    if (typeof direction === "string") {
      if (typeof fn !== "function") {
        return;
      }
      if (~directionX.indexOf(direction)) {
        queueKey = directionX[0];
      } else if (~directionAll.indexOf(direction)) {
        queueKey = directionAll[0];
      }
    } else {
      fn = direction;
    }
    queue = callbackQueue[queueKey];
    fnIdx = queue.indexOf(fn);
    if (fnIdx > -1) {
      queue.splice(fnIdx, 1);
    }
    if (!callbackQueue.x.length && !callbackQueue.y.length && !callbackQueue.any.length) {
      cancelTick();
      disableScrollListener();
    }
  };
  scrollTracker.off = scrollTracker.remove;
  var scrollTracker_default = scrollTracker;

  // src/client/index.ts
  var index = class {
    lastScrollTop = 0;
    delta = 0;
    style = "default";
    color;
    header = null;
    bodyScrolled = (scrolled = null) => {
      let { document: document2, scrollY: scrollY3 } = window, { documentElement } = document2;
      if (!scrolled) {
        scrolled = (scrollY3 || documentElement.scrollTop) - (documentElement.clientTop || 0);
      }
      if (scrolled > 1) {
        documentElement.classList.add("scrolled");
      } else {
        documentElement.classList.remove("scrolled");
      }
      this.lastScrollTop = scrollY3;
    };
    windowUnit = (event = null) => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    colourise = (scrolled = null) => {
      let { header } = this, { document: document2 } = window, { documentElement } = document2;
      const max = 600;
      const opacity = scrolled / max;
      if (scrolled > max && opacity > 3)
        return;
      if (!scrolled) {
        scrolled = (scrollY || documentElement.scrollTop) - (documentElement.clientTop || 0);
      }
      if (header && scrolled < 10) {
        header.style.transition = "background-color 200ms linear";
      }
      let headerColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${opacity.toFixed(2)} )`;
      if (header)
        header.style.setProperty("background-color", headerColor, "important");
    };
    setThemeVariation = () => {
      const themeStyle = getComputedStyle(document.body).getPropertyValue("--wp--custom--theme--name");
      themeStyle && document.documentElement.classList.add(`theme-variation-${themeStyle}`);
      this.style = themeStyle || this.style;
    };
    togglePictureInPicture = async (entries, observer) => {
      for (const entry of entries) {
        if (document.pictureInPictureEnabled && !entry.target.disablePictureInPicture) {
          entry.target.onloadedmetadata = function() {
            if (!entry.isIntersecting) {
              entry.target.requestPictureInPicture();
            }
          };
          if (entry.target.readyState >= 3 && !entry.isIntersecting) {
            await entry.target.requestPictureInPicture();
          }
        }
      }
    };
    constructor() {
      let { bodyScrolled, colourise, setThemeVariation, windowUnit, style } = this;
      this.header = document.querySelector(".has-background.is-position-sticky.is-fixed-header");
      windowUnit(null);
      window.addEventListener("resize", windowUnit);
      window.addEventListener("load", function() {
        document.documentElement.classList.add("wp-load");
      });
      setThemeVariation();
      oculus_default();
      oculus_default("video", this.togglePictureInPicture);
      imageFade_default();
      if (this.header) {
        const headerColor = getComputedStyle(this.header).getPropertyValue("background-color");
        const rgba = headerColor.includes("rgba") ? 5 : 4;
        this.color = headerColor.substring(rgba, headerColor.length - 1).replace(/ /g, "").split(",");
        colourise();
      }
      window.requestAnimationFrame(() => {
        document.documentElement.classList.add("wp-ready");
        scrollTracker_default("y", bodyScrolled);
        if (this.header)
          scrollTracker_default("y", colourise);
      });
    }
  };
  document.addEventListener("DOMContentLoaded", function() {
    const site = new index();
    site.bodyScrolled(null);
    site.windowUnit();
  });
})();
