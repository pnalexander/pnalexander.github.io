// M.AutoInit();
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.scrollspy, .parallax');
  var scrollspy = M.ScrollSpy.init(elems, {
    throttle: 500,
    scrollOffset: 100
  });
  var parallax = M.Parallax.init(elems);
});
