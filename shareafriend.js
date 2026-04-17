/**
 * ShareAFriend v1.0.0
 * A lightweight embeddable widget for linking to websites you like.
 * Host a shareafriend.json on your site to join the open social web.
 * https://github.com/carlosarthurr1/shareafriend
 * License: MIT
 */
(function () {
  "use strict";

  var DEFAULTS = {
    el: "#shareafriend",
    title: "Friends",
    theme: "light",
    links: [],
    jsonUrl: null,
    discover: false,
    compact: false,
  };

  var stylesInjected = false;

  var CSS =
    ".saf-widget{" +
    "--saf-bg:#fff;--saf-border:#e2e2e2;--saf-text:#333;--saf-text2:#777;" +
    "--saf-link:#1a6be6;--saf-link-h:#104da0;--saf-hover:#f6f6f6;--saf-radius:10px;" +
    "--saf-font:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;" +
    "font-family:var(--saf-font);background:var(--saf-bg);border:1px solid var(--saf-border);" +
    "border-radius:var(--saf-radius);overflow:hidden;max-width:320px;font-size:14px;" +
    "color:var(--saf-text);box-sizing:border-box;line-height:1.4}" +
    ".saf-widget *,.saf-widget *::before,.saf-widget *::after{box-sizing:border-box}" +
    '.saf-widget[data-theme="dark"]{' +
    "--saf-bg:#1c1c1e;--saf-border:#38383a;--saf-text:#e5e5e7;--saf-text2:#98989f;" +
    "--saf-link:#64a8f0;--saf-link-h:#8cc0f5;--saf-hover:#2c2c2e}" +
    "@media(prefers-color-scheme:dark){" +
    '.saf-widget[data-theme="auto"]{' +
    "--saf-bg:#1c1c1e;--saf-border:#38383a;--saf-text:#e5e5e7;--saf-text2:#98989f;" +
    "--saf-link:#64a8f0;--saf-link-h:#8cc0f5;--saf-hover:#2c2c2e}}" +
    ".saf-header{padding:12px 16px;font-weight:600;font-size:12px;text-transform:uppercase;" +
    "letter-spacing:.6px;color:var(--saf-text2);border-bottom:1px solid var(--saf-border)}" +
    ".saf-list{list-style:none;margin:0;padding:4px 0}" +
    ".saf-item{margin:0;padding:0}" +
    ".saf-link{display:flex;align-items:center;gap:10px;padding:8px 16px;" +
    "text-decoration:none;color:var(--saf-text);transition:background .15s ease}" +
    ".saf-link:hover{background:var(--saf-hover)}" +
    ".saf-favicon{width:20px;height:20px;border-radius:4px;flex-shrink:0;" +
    "object-fit:contain;background:var(--saf-hover)}" +
    ".saf-info{min-width:0;flex:1}" +
    ".saf-name{font-weight:500;color:var(--saf-link);white-space:nowrap;" +
    "overflow:hidden;text-overflow:ellipsis}" +
    ".saf-link:hover .saf-name{color:var(--saf-link-h)}" +
    ".saf-desc{font-size:12px;color:var(--saf-text2);white-space:nowrap;" +
    "overflow:hidden;text-overflow:ellipsis;margin-top:1px}" +
    ".saf-section{padding:8px 16px 4px;font-size:11px;font-weight:600;" +
    "text-transform:uppercase;letter-spacing:.5px;color:var(--saf-text2);opacity:.7}" +
    ".saf-footer{padding:8px 16px;text-align:center;border-top:1px solid var(--saf-border)}" +
    ".saf-footer a{font-size:11px;color:var(--saf-text2);text-decoration:none;opacity:.5;" +
    "transition:opacity .15s}" +
    ".saf-footer a:hover{opacity:1}" +
    ".saf-empty{padding:20px 16px;text-align:center;color:var(--saf-text2);" +
    "font-style:italic;font-size:13px}" +
    ".saf-compact .saf-link{padding:5px 14px}" +
    ".saf-compact .saf-header{padding:10px 14px}" +
    ".saf-compact .saf-favicon{width:16px;height:16px}" +
    ".saf-compact .saf-desc{display:none}" +
    ".saf-has-photo .saf-name::after{content:' \u2022';color:var(--saf-text2);opacity:.5;margin-left:4px}" +
    ".saf-polaroid{position:fixed;top:0;left:0;pointer-events:none;width:180px;" +
    "background:#fefefe;padding:10px 10px 38px;z-index:999999;" +
    "box-shadow:0 18px 40px rgba(0,0,0,.28),0 4px 10px rgba(0,0,0,.15);" +
    "opacity:0;transition:opacity .18s ease;will-change:transform;" +
    "transform-origin:top center}" +
    ".saf-polaroid.saf-visible{opacity:1}" +
    ".saf-polaroid::before{content:'';position:absolute;top:-10px;left:50%;" +
    "width:60px;height:18px;background:rgba(230,210,160,.65);" +
    "transform:translateX(-50%) rotate(-3deg);border-radius:1px;" +
    "box-shadow:0 1px 2px rgba(0,0,0,.1)}" +
    ".saf-polaroid-img{display:block;width:160px;height:160px;object-fit:cover;" +
    "background:#f0f0f0;border-radius:1px}" +
    ".saf-polaroid-cap{text-align:center;margin-top:12px;font-size:17px;" +
    "line-height:1;color:#222;font-family:'Segoe Script','Bradley Hand'," +
    "'Brush Script MT','Marker Felt','Comic Sans MS',cursive;" +
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "@media(hover:none){.saf-polaroid{display:none}}";

  function injectStyles() {
    if (stylesInjected) return;
    var s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    stylesInjected = true;
  }

  function faviconUrl(url) {
    try {
      var u = new URL(url);
      return (
        "https://www.google.com/s2/favicons?domain=" + u.hostname + "&sz=32"
      );
    } catch (e) {
      return "";
    }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "textContent") node.textContent = attrs[k];
        else if (k === "className") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      children.forEach(function (c) {
        if (typeof c === "string") node.appendChild(document.createTextNode(c));
        else if (c) node.appendChild(c);
      });
    }
    return node;
  }

  // Valid XFN (XHTML Friends Network) rel values, plus 'me'.
  // Keeps widget from emitting garbage rel tokens that could confuse search engines.
  var VALID_RELS = {
    contact: 1, acquaintance: 1, friend: 1, met: 1, "co-worker": 1,
    colleague: 1, "co-resident": 1, neighbor: 1, child: 1, parent: 1,
    sibling: 1, spouse: 1, kin: 1, muse: 1, crush: 1, date: 1,
    sweetheart: 1, me: 1
  };

  function normalizeRel(rel) {
    if (!rel) return "";
    return String(rel)
      .toLowerCase()
      .split(/\s+/)
      .filter(function (t) { return t && VALID_RELS[t]; })
      .join(" ");
  }

  function renderItem(link) {
    var img = el("img", {
      className: "saf-favicon",
      src: link.favicon || faviconUrl(link.url),
      alt: "",
      width: "20",
      height: "20",
      loading: "lazy",
    });
    img.onerror = function () {
      this.style.visibility = "hidden";
    };

    // Semantic microformat: each link is an h-card (indieweb-parseable)
    var nameEl = el("div", {
      className: "saf-name p-name",
      textContent: link.name || link.url,
    });
    var infoChildren = [nameEl];
    if (link.desc) {
      infoChildren.push(
        el("div", {
          className: "saf-desc p-note",
          textContent: link.desc,
        })
      );
    }

    var anchorClass = "saf-link h-card u-url" +
      (link.photo ? " saf-has-photo" : "");

    // Build rel. We INTENTIONALLY drop noreferrer so the friend's analytics
    // can see us as the referring source (credit for driving traffic).
    // We keep noopener for security. XFN rel values (friend, met, etc.)
    // are appended when provided.
    var xfnRel = normalizeRel(link.rel);
    var relAttr = xfnRel ? xfnRel + " noopener" : "noopener";

    var anchor = el(
      "a",
      {
        className: anchorClass,
        href: link.url,
        target: "_blank",
        rel: relAttr,
        title: link.name || link.url,
      },
      [img, el("div", { className: "saf-info" }, infoChildren)]
    );

    if (link.photo) {
      attachPolaroid(anchor, link);
    }

    return el("li", { className: "saf-item" }, [anchor]);
  }

  function attachPolaroid(linkEl, link) {
    // Skip on touch-only devices
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;

    var polaroid = null;
    var rafId = null;
    var mouseX = 0, mouseY = 0;
    var curX = 0, curY = 0, curRot = 0;
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function buildPolaroid() {
      var p = document.createElement("div");
      p.className = "saf-polaroid";

      var pimg = document.createElement("img");
      pimg.className = "saf-polaroid-img";
      pimg.src = link.photo;
      pimg.alt = "";
      pimg.onerror = function () {
        this.style.background = "#eee";
      };
      p.appendChild(pimg);

      var cap = document.createElement("div");
      cap.className = "saf-polaroid-cap";
      cap.textContent = link.photoCaption || link.name || "";
      p.appendChild(cap);

      return p;
    }

    function clamp(v, lo, hi) {
      return v < lo ? lo : v > hi ? hi : v;
    }

    function targetPos() {
      // Offset the polaroid from the cursor; flip to other side if near edge
      var pw = 200, ph = 240;
      var tx = mouseX + 30;
      var ty = mouseY - ph / 2;
      if (tx + pw > window.innerWidth - 10) tx = mouseX - pw - 10;
      ty = clamp(ty, 10, window.innerHeight - ph - 10);
      return { x: tx, y: ty };
    }

    function animate() {
      if (!polaroid) return;
      var t = targetPos();

      var dx = t.x - curX;
      var dy = t.y - curY;

      // Spring follow (lag creates natural swing)
      curX += dx * 0.18;
      curY += dy * 0.18;

      // Rotation reacts to horizontal lag — pendulum feel
      var targetRot = clamp(dx * 0.45, -22, 22);
      curRot += (targetRot - curRot) * 0.12;

      polaroid.style.transform =
        "translate(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px) " +
        "rotate(" + curRot.toFixed(2) + "deg)";

      rafId = requestAnimationFrame(animate);
    }

    function onEnter(e) {
      if (polaroid) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      var t = targetPos();
      curX = t.x;
      curY = t.y;
      curRot = prefersReduced ? 0 : -6;

      polaroid = buildPolaroid();
      polaroid.style.transform =
        "translate(" + curX + "px," + curY + "px) rotate(" + curRot + "deg)";
      document.body.appendChild(polaroid);

      // Trigger fade-in on next frame
      requestAnimationFrame(function () {
        if (polaroid) polaroid.classList.add("saf-visible");
      });

      if (!prefersReduced) {
        rafId = requestAnimationFrame(animate);
      }
    }

    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (prefersReduced && polaroid) {
        var t = targetPos();
        curX = t.x;
        curY = t.y;
        polaroid.style.transform =
          "translate(" + curX + "px," + curY + "px) rotate(0deg)";
      }
    }

    function onLeave() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (polaroid) {
        var p = polaroid;
        polaroid = null;
        p.classList.remove("saf-visible");
        setTimeout(function () {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 200);
      }
    }

    linkEl.addEventListener("mouseenter", onEnter);
    linkEl.addEventListener("mousemove", onMove);
    linkEl.addEventListener("mouseleave", onLeave);
  }

  function fetchJSON(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .catch(function () {
        return null;
      });
  }

  // Progressive enhancement: if the container already has <a> tags,
  // extract them as link data. Lets crawlers (and no-JS users) see real
  // links in source HTML, while JS enhances the display.
  function extractLinksFromHTML(container) {
    var anchors = container.querySelectorAll("a[href]");
    var out = [];
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") continue;
      out.push({
        name: a.textContent.trim() || href,
        url: href,
        desc: a.getAttribute("data-desc") || a.getAttribute("title") || "",
        photo: a.getAttribute("data-photo") || "",
        photoCaption: a.getAttribute("data-photo-caption") || "",
        rel: a.getAttribute("rel") || "",
        feed: a.getAttribute("data-feed") || "",
      });
    }
    return out;
  }

  function discoverFriends(links) {
    var seen = {};
    links.forEach(function (l) {
      seen[l.url] = true;
    });

    var feedLinks = links.filter(function (l) {
      return l.feed;
    });

    if (feedLinks.length === 0) return Promise.resolve([]);

    return Promise.all(
      feedLinks.map(function (link) {
        return fetchJSON(link.feed);
      })
    ).then(function (results) {
      var discovered = [];
      results.forEach(function (data) {
        if (data && data.friends) {
          data.friends.forEach(function (f) {
            if (!seen[f.url]) {
              seen[f.url] = true;
              discovered.push(f);
            }
          });
        }
      });
      return discovered;
    });
  }

  function Widget(options) {
    var opts = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      opts[k] = options && options[k] !== undefined ? options[k] : DEFAULTS[k];
    });
    this.options = opts;

    var container =
      typeof opts.el === "string" ? document.querySelector(opts.el) : opts.el;

    if (!container) {
      console.error("[ShareAFriend] Container not found:", opts.el);
      return;
    }

    // Progressive enhancement: harvest any static <a> tags already in the
    // container as link data (so they're crawlable without JS). Explicit
    // `links` option takes precedence.
    if (!options || !options.links || options.links.length === 0) {
      var harvested = extractLinksFromHTML(container);
      if (harvested.length) opts.links = harvested;
    }

    this.container = container;
    injectStyles();
    this._mount();
  }

  Widget.prototype._mount = function () {
    var self = this;
    var links = (this.options.links || []).slice();

    var next = function (loaded) {
      links = links.concat(loaded || []);

      if (self.options.discover) {
        discoverFriends(links).then(function (discovered) {
          self._render(links, discovered);
        });
      } else {
        self._render(links, []);
      }
    };

    if (this.options.jsonUrl) {
      fetchJSON(this.options.jsonUrl).then(function (data) {
        next(data && data.friends ? data.friends : []);
      });
    } else {
      next([]);
    }
  };

  Widget.prototype._render = function (links, discovered) {
    var opts = this.options;
    var classes = "saf-widget" + (opts.compact ? " saf-compact" : "");
    var widget = el("div", { className: classes, "data-theme": opts.theme });

    if (opts.title) {
      widget.appendChild(
        el("div", { className: "saf-header", textContent: opts.title })
      );
    }

    if (links.length === 0 && discovered.length === 0) {
      widget.appendChild(
        el("div", { className: "saf-empty", textContent: "No links yet." })
      );
    } else {
      if (links.length > 0) {
        var list = el("ul", { className: "saf-list" });
        links.forEach(function (link) {
          list.appendChild(renderItem(link));
        });
        widget.appendChild(list);
      }

      if (discovered.length > 0) {
        widget.appendChild(
          el("div", {
            className: "saf-section",
            textContent: "Discover",
          })
        );
        var dlist = el("ul", { className: "saf-list" });
        discovered.forEach(function (link) {
          dlist.appendChild(renderItem(link));
        });
        widget.appendChild(dlist);
      }
    }

    var footer = el("div", { className: "saf-footer" }, [
      el("a", {
        href: "https://github.com/carlosarthurr1/shareafriend",
        target: "_blank",
        rel: "noopener",
        textContent: "\u260D ShareAFriend",
      }),
    ]);
    widget.appendChild(footer);

    this.container.innerHTML = "";
    this.container.appendChild(widget);
    this.widget = widget;
  };

  Widget.prototype.update = function (links) {
    this.options.links = links;
    this._mount();
  };

  window.ShareAFriend = {
    version: "1.0.0",
    init: function (options) {
      return new Widget(options);
    },
  };
})();
