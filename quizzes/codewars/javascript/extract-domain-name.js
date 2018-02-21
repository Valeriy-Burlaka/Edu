// https://www.codewars.com/kata/514a024011ea4fb54200004b/train/javascript
//
// Write a function that when given a URL as a string, parses out just
// the domain name and returns it as a string. For example:
//
// domainName("http://github.com/carbonfive/raygun") == "github"
// domainName("http://www.zombie-bites.com") == "zombie-bites"
// domainName("https://www.cnet.com") == "cnet"

function domainName(url){
  let pattern = /(https?[:/]+)?(www[.]{1})?([\w-]+)/;
  return url.match(pattern)[3];
};

console.assert(domainName("http://google.com") == "google");
console.assert(domainName("http://google.co.jp") == "google");
console.assert(domainName("www.xakep.ru") == "xakep");
console.assert(domainName("https://youtube.com") == "youtube");
console.assert(domainName("https://hyphen-foo-site.com") == "hyphen-foo-site");
console.assert(domainName("https://www.sd9vc4u-h5tjlch58em.jp/archive/") == "sd9vc4u-h5tjlch58em");
