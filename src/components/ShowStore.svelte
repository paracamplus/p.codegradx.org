<div class='w3-container'>

  <h2> Content of session </h2>
  <div class='w3-container'>
    <pre>{JSON.stringify(get(session))}</pre>
  </div>

  {#if dev}
  <h2> Content of Store </h2>
  <div class='w3-container'>
    <table class='w3-table w3-striped w3-bordered'>
      <tr><td>config</td><td>{JSON.stringify($config)}</td></tr>
      <tr><td>person</td><td>{JSON.stringify($person)}</td></tr>
      <tr><td>campaign</td><td>{JSON.stringify($campaign)}</td></tr>
      <tr><td>current_exercise</td>
        <td>{JSON.stringify($current_exercise)}</td></tr>
    </table>
  </div>
  {/if}
  
</div>

<script>
 import { onMount } from 'svelte';
 import { person, config, campaign, current_exercise } from '../stores.mjs';
 import { stores } from '@sapper/app';
 const { session } = stores();
 import { get } from 'svelte/store';
 export let dev = false;

 onMount(() => {
   try {
     dev = get(session).dev;
   } catch (exc) {
     // ignore
   }
 });
 
</script>
