{#if error}
<div class='w3-panel w3-red' data-within={within}>{error}</div>
{/if}

<script>
 export let error = undefined;
 export let within = '';
</script>
