
<tr bind:this={lastLineTarget} >
  <td on:click={seeMore}
      class='w3-center'
      colspan={colspan} >
    <span class='w3-btn w3-round-xxlarge w3-theme-l4'>
      {message}</span></td>
</tr>

<script>
 import { onMount, createEventDispatcher  } from 'svelte';
 const dispatch = createEventDispatcher();
 import { spreadItems, installTarget, reverse } from '../client/spreadlib.mjs';
  
 export let colspan = 1;
 export let message = '';
 export let seeMore;
 let lastLineTarget;

 onMount(() => {
   installTarget (lastLineTarget, seeMore);
 });

</script>
