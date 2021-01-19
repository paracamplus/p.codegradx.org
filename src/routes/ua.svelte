<style>
</style>

<svelte:head>
  <title>CodeGradX/ConditionsUsage</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <p>
    Vous pouvez maintenant finaliser votre inscription en prenant
    connaissance des dispositions légales quant à votre usage de
    l'infrastructure CodeGradX. Si vous êtes d'accord avec ces conditions
    d'usage, n'oubliez pas de les accepter en bas de page.
  </p>
  <p>
    Accepter ces conditions d'usage c'est, en très gros, accepter de
    donner ses programmes à la science afin d'aider les auteurs
    à améliorer leurs exercices.
  </p>
</section>

<UA />

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import UA from '../components/UA.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';

</script>
