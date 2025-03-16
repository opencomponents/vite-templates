<script lang="ts">
  import logo from '../public/logo.png';
  import { InitialData, serverClient } from 'oc-server';

  let funFact: string | null = $state(null);
  let { born, firstName, hobbies, lastName }: InitialData = $props();
  let getFunFact = async () => {
    let response = await serverClient.funFact({ year: born });
    funFact = response.funFact;
  };
</script>

<div class="container">
  <img width="50" height="50" src={logo} alt="Logo" />

  <h1>
    Hello, <span>{firstName}</span>
    {lastName}
  </h1>
  <div class="info">
    <div class="block">Born: {born}</div>
    <div class="block">
      Hobbies: {hobbies}
    </div>
  </div>
  {#if funFact}
    <div>{funFact}</div>
  {/if}
  <button class="button" onclick={getFunFact}> Fun year fact </button>
</div>

<style>
  .container {
    background-color: #3b246c;
    color: #fff;
    font-family: sans-serif;
    padding: 40px;
  }

  .button {
    background-color: #a97613;
    border: none;
    padding: 15px 32px;
    text-align: center;
    font-size: 16px;
    text-decoration: none;
    display: inline-block;
    color: inherit;
    cursor: pointer;
  }

  .button:hover {
    background-color: #c79535;
  }

  h1 {
    margin: 0 0 20px 0;
  }

  span {
    text-decoration: underline;
  }

  .info {
    margin-bottom: 20px;
  }

  .block {
    margin: 6px 0;
  }
</style>
