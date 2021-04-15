{#if message}
<div class='warningMessage'>
  {message}
</div>
{/if}

<script>
 import { onMount } from 'svelte';
 import { lastmessage } from '../stores.mjs';
 import { sleep } from '../common/utils.mjs';

 export let message = undefined;
 export let timeout = 9;

 onMount(async () => {
   if ( $lastmessage ) {
     message = $lastmessage;
     $lastmessage = undefined;
     await sleep(timeout);
     message = undefined;
   }
 });

</script>
