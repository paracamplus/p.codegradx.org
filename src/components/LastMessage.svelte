{#if message}
<div class='warningMessage'>
  {message}
</div>
{/if}

<script>
 import { onMount } from 'svelte';
 import { lastmessage } from '../stores.mjs';

 export let message = undefined;

 onMount(() => {
   if ( $lastmessage ) {
     message = $lastmessage;
     $lastmessage = undefined;
   }
 });

</script>
