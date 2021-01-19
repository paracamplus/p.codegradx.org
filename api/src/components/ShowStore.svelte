{#if dev}
<div class='w3-container'>
  <table class='w3-table w3-striped w3-bordered'>
    <tr><td>person</td><td>{JSON.stringify($person)}</td></tr>
  </table>
</div>
{/if}

<script>
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { stores } from '@sapper/app';
 const { session } = stores();
 import { get } from 'svelte/store';
 //console.log('session', get(session));//
 export let dev = false;

 onMount(() => {
   dev = get(session).dev;
 });
 
</script>
