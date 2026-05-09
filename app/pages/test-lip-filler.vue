<template>
  <div class="test-page">
    <h1>Lippen Aufpolsterung Landing Page - TEST</h1>
    <p>Diese Seite wurde am 2026-05-09 um 14:33 UTC gebaut.</p>
    
    <section class="hero">
      <h2>Natürliche volle Lippen – Jetzt möglich</h2>
      <p>Board-zertifizierte Ärzte. Transparente Preise. 30-Tage Garantie.</p>
      <button class="btn">Kostenlose Beratung buchen</button>
    </section>

    <section class="gallery">
      <h2>Echte Patienten-Ergebnisse</h2>
      <div class="gallery-grid">
        <div v-for="i in 4" :key="i" class="gallery-item">
          <div class="placeholder-image">Vorher-Nachher {{ i }}</div>
        </div>
      </div>
    </section>

    <section class="testimonials">
      <h2>Was Patienten sagen</h2>
      <div class="testimonials-grid">
        <div class="testimonial">
          <p>"Meine Lippen sehen natürlich aus – nicht gemacht."</p>
          <p><strong>Claire S., 32</strong></p>
        </div>
        <div class="testimonial">
          <p>"Ich sehe wieder mich aus."</p>
          <p><strong>Regina M., 48</strong></p>
        </div>
        <div class="testimonial">
          <p>"Definitionen sind alles! Ein echtes Statement."</p>
          <p><strong>Bella L., 26</strong></p>
        </div>
        <div class="testimonial">
          <p>"Die Beratung war sehr wissenschaftlich."</p>
          <p><strong>Teresa K., 52</strong></p>
        </div>
      </div>
    </section>

    <section class="pricing">
      <h2>Klare Preise</h2>
      <div class="pricing-grid">
        <div class="price-card">
          <h3>Subtle Hydration</h3>
          <p class="price">€299</p>
          <p>0.5 mL - Perfekt für erste Mal</p>
        </div>
        <div class="price-card featured">
          <h3>Full Volume (Beliebtest)</h3>
          <p class="price">€499</p>
          <p>1 mL - Perfektes Gleichgewicht</p>
        </div>
        <div class="price-card">
          <h3>Ultimate Fuller</h3>
          <p class="price">€699</p>
          <p>1.5 mL - Maximum Confidence</p>
        </div>
      </div>
    </section>

    <section class="cta">
      <h2>Bereit für volle Lippen?</h2>
      <button class="btn btn-primary">Jetzt buchen</button>
    </section>
  </div>
</template>

<script setup lang="ts">
// Ultra-simple page with no composables
console.log('Test page loaded');
</script>

<style scoped lang="scss">
.test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #D4A574;
  margin-bottom: 10px;
}

section {
  margin: 60px 0;
  padding: 40px 20px;
  border-radius: 8px;
  background: #F5F1ED;
}

section h2 {
  color: #2C2C2C;
  margin-bottom: 30px;
  text-align: center;
}

.hero {
  background: linear-gradient(135deg, #D4A574 0%, #8B6F47 100%);
  color: white;
  text-align: center;

  h2 { color: white; }
  p { font-size: 18px; margin-bottom: 20px; }
}

.btn {
  background: #E8424F;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #D63039;
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.gallery-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.placeholder-image {
  background: #ddd;
  padding: 80px 20px;
  border-radius: 4px;
  color: #666;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.testimonial {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #D4A574;
  
  p {
    margin: 10px 0;
    line-height: 1.6;
  }

  strong {
    color: #8B6F47;
  }
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.price-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  border: 2px solid #ddd;
  text-align: center;

  h3 {
    margin-bottom: 15px;
    color: #2C2C2C;
  }

  .price {
    font-size: 28px;
    color: #D4A574;
    font-weight: bold;
    margin-bottom: 10px;
  }

  &.featured {
    border-color: #D4A574;
    background: linear-gradient(135deg, rgba(212, 165, 116, 0.05) 0%, rgba(139, 111, 71, 0.05) 100%);
    transform: scale(1.05);
  }
}

.cta {
  text-align: center;
  background: #D4A574;
  color: white;

  h2 { color: white; }

  .btn-primary {
    background: #E8424F;
    font-size: 18px;
    padding: 16px 48px;
  }
}
</style>
