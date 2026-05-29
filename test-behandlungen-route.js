// Quick SSR test simulation
const pathKey = "botox";

console.log("Testing route: /behandlungen/" + pathKey);
console.log("Route params:", { slug: [pathKey] });
console.log("Strapi API would be called with:", `/treatment-pages/by-path/${pathKey}`);

// Simulate what the page does
const treatmentPathKey = [pathKey].filter(Boolean).join("/");
console.log("Joined pathKey:", treatmentPathKey);
