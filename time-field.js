/* WeGoGym time boxes: wegogym.club sign-up forms.
 *
 * Turns every <input type="time"> on the page (including ones added later) into a 24-hour
 * "HH:MM" box with two parts, hours and minutes. The part you are typing into is highlighted.
 * Typing two digits moves from hours to minutes. Backspace in an empty minutes part goes back
 * to hours. Left and right arrows, Tab and ":" move between the parts.
 *
 * The box still has a normal .value: "HH:MM" once both parts are filled, otherwise "". Other
 * scripts read and set it exactly as they did with the browser's own time box.
 */
(function () {
  "use strict";
  var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  var FULL = /^([01]\d|2[0-3]):[0-5]\d$/;

  function enhance(el) {
    if (el._wggTime) return;
    el._wggTime = true;
    var start = proto.get.call(el);
    el.type = "text";
    el.setAttribute("inputmode", "numeric");
    el.setAttribute("autocomplete", "off");
    el.setAttribute("spellcheck", "false");
    el.setAttribute("placeholder", "HH:MM");
    el.classList.add("wgg-time");

    var hh = "", mm = "", seg = 0, fresh = true; // fresh: the next digit starts the part over
    function text() { return !hh && !mm ? "" : (hh || "--") + ":" + (mm || "--"); }
    function paint() {
      proto.set.call(el, text());
      if (document.activeElement === el) select();
    }
    function select() { // highlight the part being typed into
      if (!proto.get.call(el)) return;
      if (seg === 0) el.setSelectionRange(0, 2); else el.setSelectionRange(3, 5);
    }
    function loadFrom(t) {
      var m = /^(\d{1,2}):(\d{2})/.exec(String(t || "").trim());
      if (m) { hh = ("0" + m[1]).slice(-2); mm = m[2]; } else { hh = ""; mm = ""; }
    }
    function tell() {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    function showSeg() { // text() is empty until something is typed: show the blank pattern while editing
      if (!text()) { proto.set.call(el, "--:--"); }
      select();
    }

    Object.defineProperty(el, "value", {
      get: function () { var t = proto.get.call(el); return FULL.test(t) ? t : ""; },
      set: function (v) { loadFrom(v); proto.set.call(el, text()); }
    });
    loadFrom(start);
    proto.set.call(el, text());

    function typeDigit(d) {
      var n = Number(d);
      if (seg === 0) {
        if (fresh || hh.length === 2) {
          if (n > 2) { hh = "0" + d; seg = 1; fresh = true; }
          else { hh = d; fresh = false; }
        } else {
          var two = hh + d; hh = Number(two) > 23 ? "23" : two; seg = 1; fresh = true;
        }
      } else {
        if (fresh || mm.length === 2) {
          if (n > 5) { mm = "0" + d; fresh = true; } else { mm = d; fresh = false; }
        } else { mm = mm + d; fresh = true; }
      }
    }

    var justFocused = false;
    el.addEventListener("focus", function () {
      seg = 0; fresh = true; justFocused = true;
      showSeg();
      setTimeout(function () { showSeg(); justFocused = false; }, 0);
    });
    el.addEventListener("mouseup", function (e) { // clicking picks the part under the pointer
      if (justFocused) { e.preventDefault(); showSeg(); return; }
      var at = el.selectionStart;
      setTimeout(function () { seg = at > 2 ? 1 : 0; fresh = true; showSeg(); }, 0);
    });
    el.addEventListener("blur", function () {
      if (hh.length === 1) hh = "0" + hh;
      if (mm.length === 1) mm = "0" + mm;
      proto.set.call(el, text()); // empty again shows the HH:MM hint
      tell();
    });
    // Text that arrives without key presses (autofill, dictation, a pasted menu choice): read the
    // digits in it, so "07:00", "0700" and "07:00:--" all become 07:00. Our own events have no inputType.
    el.addEventListener("input", function (e) {
      if (!e.inputType) return;
      var d = proto.get.call(el).replace(/\D/g, "");
      if (d.length >= 3) { d = d.slice(0, 4); if (d.length === 3) d = "0" + d; hh = d.slice(0, 2); mm = d.slice(2); }
      else if (d.length === 2) { hh = d; mm = ""; }
      proto.set.call(el, text());
    });
    el.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (/^\d$/.test(k)) {
        e.preventDefault(); typeDigit(k); paint(); tell(); return;
      }
      if (k === "Backspace" || k === "Delete") {
        e.preventDefault();
        if (seg === 1) {
          if (mm) { mm = mm.slice(0, -1); fresh = !mm; }
          else { seg = 0; fresh = true; } // nothing left in minutes: back into hours
        } else { hh = hh.slice(0, -1); fresh = !hh; }
        paint(); if (!text()) proto.set.call(el, "--:--"); select(); tell(); return;
      }
      if (k === "ArrowLeft") { e.preventDefault(); seg = 0; fresh = true; showSeg(); return; }
      if (k === "ArrowRight" || k === ":" || k === "." || k === ",") { e.preventDefault(); seg = 1; fresh = true; showSeg(); return; }
      if (k === "Tab") {
        if (!e.shiftKey && seg === 0) { e.preventDefault(); seg = 1; fresh = true; showSeg(); }
        else if (e.shiftKey && seg === 1) { e.preventDefault(); seg = 0; fresh = true; showSeg(); }
        return;
      }
      if (k === "ArrowUp" || k === "ArrowDown") {
        e.preventDefault();
        var d = k === "ArrowUp" ? 1 : -1;
        if (seg === 0) hh = ("0" + (((Number(hh || 0) + d) % 24 + 24) % 24)).slice(-2);
        else mm = ("0" + (((Number(mm || 0) + d) % 60 + 60) % 60)).slice(-2);
        if (!hh) hh = "00"; if (!mm) mm = "00";
        paint(); tell(); return;
      }
      if (k.length === 1) e.preventDefault(); // letters and symbols do nothing
    });
    el.addEventListener("paste", function (e) {
      e.preventDefault();
      var t = (e.clipboardData && e.clipboardData.getData("text")) || "";
      var m = /^\s*(\d{1,2})[:.]?(\d{2})\s*$/.exec(t);
      if (m && FULL.test(("0" + m[1]).slice(-2) + ":" + m[2])) { hh = ("0" + m[1]).slice(-2); mm = m[2]; paint(); tell(); }
    });
  }

  function scan(root) {
    Array.prototype.forEach.call((root.querySelectorAll ? root.querySelectorAll('input[type="time"]') : []), enhance);
    if (root.matches && root.matches('input[type="time"]')) enhance(root);
  }
  function start() {
    scan(document);
    new MutationObserver(function (list) {
      list.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); }); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
