<style>
 li span.va {
   /* vertical-align: 0px; */
   width: 80vw;
 }
 .videoWrapper {
   height: 100px;
 }
 .videoWrapper iframe {
   top: 0;
   left: 0;
   width: 20%;
   height: auto !important;
 }
</style>

<Page shortTitle="Univers"
      title="Univers de programmation" >

<section class='w3-container'>
 <div class='w3-padding'>
   {#if $person}
    <p>Bonjour <span class='personName'>{$person.pseudo}</span>,
      sélectionnez l'univers d'exercices que vous souhaitez explorer.
    </p>
   {:else}
    <p> Sélectionnez, après vous être identifié,
        l'univers d'exercices que vous souhaitez explorer. <br />
   {/if}

   <p class='smallHint'>
     Le titre indique s'il est en anglais ou en français.
   </p>

  {#if showauthentication}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href='/connect' >
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}
  
  <div class='w3-container'>
    <ul class='w3-ul'>
      
      <li lang='fr'>
        <span class='va'>
          <a href='/universe/scm'
             class='w3-btn w3-round-xlarge w3-theme-l4' >Scheme</a> 
          exercices issus du <a href='https://programmation-recursive.net/'
                class='w3-btn w3-round-xlarge w3-theme-l4' >
            MOOC « Programmation récursive »</a>
        </span>
        <span on:click={() => {showmoocprogrec = ! showmoocprogrec}}
              class='videoWrapper'>
          {#if showmoocprogrec}
          <iframe width='560' height='315'
                  title="Bande annonce du MOOC programmation récursive"
                  src="https://www.youtube.com/embed/nu9_3ZZ1k2M"
                  frameborder='0'
                  allowfullscreen ></iframe>
          {:else}
            <Picture image='/moocprogrec'
                     alt='Video du MOOC Programmation récursive' />
          {/if}
          </span>
      </li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="/universe/unx"
           class='w3-btn w3-round-xlarge w3-theme-l4' > 
          <code>shell</code>
          </a> et autres utilitaires Unix (sed, tr, head, tail, cut,
          grep, sh, etc.)</span></li>
      
      <li lang='en'>
        <span class='va'><em>
          <a href="/universe/js"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Javascript </a>
          exercices from the <a href='https://diffusejavascript.codegradx.org/'
                      class='w3-btn w3-round-large w3-theme-l4'>
            MOOC « Diffuse JavaScript »</a></em>
        </span>
        <span on:click={() => {showmoocjs = ! showmoocjs}}
              class='videoWrapper'>
          {#if showmoocjs}
          <iframe width='560' height='315'
                  title="Teaser for the Diffuse JavaScript MOOC"
                  src="https://www.youtube.com/embed/6Ka2NoPcWck" 
                  frameborder='0'
                  allowfullscreen ></iframe>
          {:else}
            <Picture image='/moocjs' 
                     alt='Video of the MOOC Diffuse JavaScript' />
          {/if}
          </span>
      </li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="/universe/cc"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            C
          </a> exercices du <a href="https://www.fun-mooc.fr/courses/course-v1:itii+119003+session03/about" class='w3-btn w3-round-large w3-theme-l4'>
            MOOC Socle informatique du CNAM </a>
        </span></li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="/universe/python"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Python
          </a> exercices en Python du cours IN101 :
          Algorithmique et programmation
          de l'ENSTA ParisTech</span></li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="/universe/jfp"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Journées Franciliennes de Programmation
          </a> (langage libre)</span></li>
    </ul>
  </div>

  </div>
</section>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Picture from '../components/Picture.svelte';
 //import Warning from '../components/Warning.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { fade } from 'svelte/transition';
 import { person, campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';

 let showmoocjs = false;
 let showmoocprogrec = false;
 let showauthentication = false;
 
 onMount(async () => {
   $person = await initializePerson();
   if ( ! $person ) {
     showauthentication = true;
   }
   $campaign = undefined;
 });

</script>
