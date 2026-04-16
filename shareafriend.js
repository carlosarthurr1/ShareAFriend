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
    ".saf-compact .saf-desc{display:none}";

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

    var infoChildren = [
      el("div", { className: "saf-name", textContent: link.name || link.url }),
    ];
    if (link.desc) {
      infoChildren.push(
        el("div", { className: "saf-desc", textContent: link.desc })
      );
    }

    var anchor = el(
      "a",
      {
        className: "saf-link",
        href: link.url,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      [img, el("div", { className: "saf-info" }, infoChildren)]
    );

    return el("li", { className: "saf-item" }, [anchor]);
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
