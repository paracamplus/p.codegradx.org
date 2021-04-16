<style>
 div.publicity {
   max-height: 90px;
   max-width: 100vw;
 }
 div.publicityContent {
   height: 90px;
   background-color: var(--color-theme-l4);
 }
 </style>

{#if showPublicity}
<div class='publicity'>
  {#if dev}<div class='publicityContent'></div>{/if}
</div>
{/if}

<script>
 import { config } from '../stores.mjs';
 import { onClient } from '../common/utils.mjs';

 export let dev = false;
 let showPublicity = false;

 onClient(() => {
   if ( $config.publicity ) {
     showPublicity = $config.publicity;
   }
 });
 
</script>
