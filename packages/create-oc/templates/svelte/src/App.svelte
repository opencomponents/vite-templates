<script lang="ts">
  import logo from '../public/logo.png';
  import { type InitialData, serverClient } from 'oc-server/client';

  let { name, year }: InitialData = $props();
  let fact: string | null = $state(null);
  let loading = $state(false);
  let error = $state('');
  let getFunFact = async () => {
    loading = true;
    error = '';
    try {
      let response = await serverClient.funFact({ year });
      fact = response.funFact;
    } catch (err) {
      error = String(err);
    } finally {
      loading = false;
    }
  };
</script>

<div class="container">
  <div class="card">
    <div class="brand">
      <img class="logo" width="40" height="40" src={logo} alt="Logo" />
      <p class="eyebrow">OpenComponents · Vite</p>
    </div>
    <h1 class="title">Hello, <span class="name">{name}</span></h1>
    <p class="subtitle">Born in <span class="pill">{year}</span></p>
    {#if fact}
      <div class="fact">{fact}</div>
    {/if}
    {#if error}
      <div class="error">{error}</div>
    {/if}
    <button class="button" onclick={getFunFact} disabled={loading}>
      {loading ? 'Loading…' : 'Fun year fact'}
    </button>
  </div>
</div>

<style>
  .container {
    background-color: #0f172a;
    color: #fff;
    font-family: 'DejaVu Sans', system-ui, -apple-system, 'Segoe UI', Roboto,
      sans-serif;
    padding: 56px 24px;
  }

  .card {
    background-color: #ffffff;
    color: #0f172a;
    border-radius: 20px;
    padding: 32px;
    max-width: 440px;
    margin: 0 auto;
    box-shadow: 0 12px 32px rgba(2, 6, 23, 0.45);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .logo {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: block;
  }

  .eyebrow {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #4f46e5;
  }

  .title {
    margin: 0 0 8px 0;
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .name {
    color: #4f46e5;
  }

  .subtitle {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #475569;
  }

  .pill {
    display: inline-block;
    background-color: #eef2ff;
    color: #4338ca;
    border-radius: 999px;
    padding: 2px 12px;
    font-weight: 700;
  }

  .button {
    margin-top: 20px;
    width: 100%;
    background-color: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  .button:hover {
    background-color: #4338ca;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .fact {
    margin-top: 20px;
    background-color: #eef2ff;
    border-left: 4px solid #4f46e5;
    border-radius: 0 12px 12px 0;
    padding: 14px 16px;
    font-size: 15px;
    line-height: 1.5;
    color: #1e1b4b;
  }

  .error {
    margin-top: 20px;
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    border-radius: 0 12px 12px 0;
    padding: 14px 16px;
    font-size: 15px;
    line-height: 1.5;
    color: #991b1b;
  }
</style>
