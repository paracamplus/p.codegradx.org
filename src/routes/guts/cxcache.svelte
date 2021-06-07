<Page shortTitle='Guts/cxcache'
      title='Guts/CodeGradX cache' >

  <section class='w3-container'>
    <p class='smallHint'>
      Cliquer une entrée la révèle ou la masque.
    </p>
    
    {#if state}
      {#each Object.keys(state.caches) as kind}
      <section class='w3-container w3-margin-top'>
        <header> Cache {kind} ({state.cacherType}) </header>
        {#each state.caches[kind].keys() as entry}
        <div>
          <em on:click={mkShowEntry(kind,entry)}>{entry}</em>
          {#if Object.keys(shown).length && isShown(kind, entry)}
          <pre class='w3-container'>{show(kind,entry)}</pre>
          {/if}
        </div>
        {:else}
        <div> cache vide! </div>
        {/each}
      </section>
      {/each}
    {:else}
      <WaitingImage message="Chargement des données..." />
    {/if}

  </section>
</Page>

<script>
 import Page from '../../components/Page.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';

 import { onMount } from 'svelte';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { CodeGradX } from 'codegradx';

 let state;
 let shown = {};

 function mkShowEntry (kind, key) {
   return function showEntry (event) {
     shown[`${kind}-${key}`] = !!! shown[`${kind}-${key}`];
   };
 }

 function isShown (kind, key) {
   return shown[`${kind}-${key}`];
 }

 function show (kind, key) {
   const o = state.caches[kind].get(key);
   if ( typeof o === 'string' ) {
     return o;
   } else if ( typeof o === 'object' ) {
     return JSON.stringify(o, null, 4);
   } else {
     return o.toString();
   }
 }

 onMount(() => {
   state = CodeGradX.getCurrentState();
   //console.log('cxcache', {caches: state.caches});
 });

</script>
