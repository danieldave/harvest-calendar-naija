/* Harvest Calendar Naija - MY FARM (on every page)
 * ------------------------------------------------------------------
 * If you are signed in to My Farm, this file quietly remembers what
 * you look up: the crop page you open, or the state and crop you check
 * on "Plant Now". It also shows your username in the menu.
 * If you are not signed in, it does nothing.
 * ------------------------------------------------------------------ */
(function () {
  "use strict";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var token = get("hc-token"), name = get("hc-user");
  window.MyFarm = {
    token: function () { return get("hc-token"); },
    call: function (body) {
      return fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.signedOut) { try { localStorage.removeItem("hc-token"); localStorage.removeItem("hc-user"); } catch (e) {} } return d; });
    },
    save: function (crop, state) { var t = get("hc-token"); if (!t || (!crop && !state)) return; window.MyFarm.call({ action: "save", token: t, crop: crop || "", state: state || "" }).catch(function () {}); }
  };
  // the menu link shows who is signed in
  document.querySelectorAll('a[href="/account.html"]').forEach(function (a) { if (token && name) a.textContent = "👤 " + name; });
  if (!token) return;
  var id = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  // 1. opening a crop page or a state page counts as a look-up
  var m = location.pathname.match(/^\/(crops|states)\/([a-z0-9-]+)\/?$/);
  if (m) window.MyFarm.save(m[1] === "crops" ? m[2] : "", m[1] === "states" ? m[2] : "");
  // 2. checking "Plant Now" saves the state and the crop
  var form = document.getElementById("plantForm");
  if (form) form.addEventListener("submit", function () {
    var s = document.getElementById("plantState"), c = document.getElementById("plantCrop");
    var label = function (sel) { return sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent.replace(/^[^A-Za-z]+/, "").split("(")[0].trim() : ""; };
    window.MyFarm.save(id(c && (c.value.length > 2 ? c.value : label(c))) , id(s && (s.value.length > 2 ? s.value : label(s))));
  });
})();
