<Page shortTitle='Guts/cache'
      title='Guts/cache' >
  <div class='w3-container'>
    <table class='w3-table w3-hoverable'>
      <tr><th>URL</th></tr>
      {#each cacheLines as cacheLine}
      <tr>
        <td>{cacheLine.url}</td>
      </tr>
      {/each}
    </table>
  </div>
</Page>

<script>
 import Page from '../../components/Page.svelte';
 
 import { onMount } from 'svelte';
 //import { onClient } from '../../common/utils.mjs';
 
 let cacheLines = [];

 function processMessage (event) {
   console.log(`fromSW`, event);
   if ( event.data.kind ) {
     if ( event.data.kind === 'CACHE_CONTENT' ) {
       cacheLines = event.data.cacheLines;
       //console.log(cacheLines);
     } else if ( event.data.kind === 'FETCH' ) {
       console.log('fetching');
     } else {
       console.log('processMessage unexpected kind', event);
     }
   } else {
     console.log('processMessage unexpected event', event);
   }
 }
 
 onMount(() => {
   const sw = navigator.serviceWorker;
   // typeof navigator.serviceWorker = 'ServiceWorkerContainer'
   //console.log(sw); // DEBUG
   sw.ready.then(() => {
     sw.startMessages();
     sw.addEventListener('message', processMessage);
     sw.addEventListener('error', console.log);
     sw.addEventListener('messageerror', console.log);
     if ( sw.controller ) {
       sw.controller.addEventListener('error', console.log);
       sw.controller.postMessage({
         kind: 'CACHE_CONTENT_REQUEST'
       });
       //console.log(sw); // DEBUG
       console.log(`toSW sending CACHE_CONTENT_REQUEST`);
     } else {
       console.log(`serviceworker controller not ready`);
     }
   });
 });


</script>
