<style>
 div.w3-panel {
   background-color: var(--color-error);
 }
</style>

{#if error}
<div class='w3-panel'
     transition:fade
     data-within={within}>{error}</div>
{/if}

<script>
 import { fade } from 'svelte/transition';
 
 export let error = undefined;
 export let within = '';
</script>
