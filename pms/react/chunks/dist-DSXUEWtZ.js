// node_modules/@radix-ui/number/dist/index.mjs
var e = Object.defineProperty, t = (t, n) => e(t, "name", {
	value: n,
	configurable: !0
});
function n(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
t(n, "clamp");
export { n as t };
