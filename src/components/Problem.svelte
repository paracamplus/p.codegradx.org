{#if error}
<div class='w3-panel w3-red'
     transition:fade
     data-within={within}>{error}</div>
{/if}

<script>
 import { fade } from 'svelte/transition';
 
 export let error = undefined;
 export let within = '';
</script>
