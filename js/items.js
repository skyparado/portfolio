/* Pixel items shared by the home page and the workshop. */
(function () {
  'use strict';
  /* ---------- pixel items ----------
     Each item is a 12 x 12 grid; a letter is one pixel of that colour and '.' is empty.
     <i data-item="name"></i> anywhere on the page becomes that drawing. */
  var INK = { G: '#edc778', g: '#bb864f', P: '#e7a8c6', p: '#9b729c', A: '#a9d8db', a: '#648da1', L: '#c9bfdc', l: '#9a829d',
              M: '#a9d4bd', m: '#587c77', W: '#fff0dc', D: '#75658a', B: '#d9ab7a', b: '#9a6f47' };
  var ITEMS = {
    web:     ['............', '.llllllllll.', '.lPlGlMllll.', '.llllllllll.', '.lWWWWWWWWl.', '.lWLLLLWAAl.', '.lWWWWWWAAl.', '.lWLLLWWAAl.', '.lWWWWWWWWl.', '.lWLLLLLLWl.', '.llllllllll.', '............'],
    ai:      ['.....pp.....', '.....pp.....', '..PPPPPPPP..', '..PWWPPWWP..', '..PWDPPWDP..', '..PPPPPPPP..', '.pPPDDDDPPp.', '..PPPPPPPP..', '....pppp....', '..PPPPPPPP..', '..PWPPPPGP..', '..PPPPPPPP..'],
    net:     ['....AAAA....', '....AWWA....', '....AAAA....', '.....aa.....', '.....aa.....', '.aaaaaaaaaa.', '.aa......aa.', '.aa......aa.', 'AAAA....AAAA', 'AWWA....AWWA', 'AAAA....AAAA', '............'],
    sec:     ['............', '.gggggggggg.', '.gGGGGGGGGg.', '.gGGGWWGGGg.', '.gGGGWWGGGg.', '.gGWWWWWWGg.', '.gGGGWWGGGg.', '.gGGGWWGGGg.', '..gGGGGGGg..', '...gGGGGg...', '....gGGg....', '.....gg.....'],
    sys:     ['...m.mm.m...', '...m.mm.m...', '..mmmmmmmm..', 'mmmMMMMMMmmm', '..mMWWWWMm..', 'mmmMWDDWMmmm', 'mmmMWDDWMmmm', '..mMWWWWMm..', 'mmmMMMMMMmmm', '..mmmmmmmm..', '...m.mm.m...', '...m.mm.m...'],
    bug:     ['..D......D..', '...D....D...', '....pPPp....', '.D.pPPPPp.D.', '..DpPDPPpD..', '...pPPDPp...', 'DDDpPDPPpDDD', '...pPPDPp...', '..DpPPPPpD..', '.D..pPPp..D.', '.....pp.....', '............'],
    star:    ['.....GG.....', '.....GG.....', '....GGGG....', 'GGGGGGGGGGGG', '.GGGWGGGGGG.', '..GGWGGGGG..', '...GGGGGG...', '...GGGGGG...', '..GGGggGGG..', '..GGg..gGG..', '.GGg....gGG.', '.gg......gg.'],
    trophy:  ['..GGGGGGGG..', 'gGGWGGGGGGGg', 'g.GWGGGGGG.g', 'g.GWGGGGGG.g', '.gGGGGGGGGg.', '...GGGGGG...', '....GGGG....', '.....GG.....', '.....GG.....', '...gggggg...', '..pppppppp..', '............'],
    journal: ['............', '.lLLLLLLLLl.', '.lLWWWWWWLl.', '.lLWllllWLl.', '.lLWWWWWWLl.', '.lLWlllWWLl.', '.lLWWWWWWLl.', '.lLLLLLLLLl.', '.lLLLPPLLLl.', '.lLLLPPLLLl.', '.llllllllll.', '............'],
    mail:    ['............', '............', 'pppppppppppp', 'pPWWWWWWWWPp', 'pWPWWWWWWPWp', 'pWWPWWWWPWWp', 'pWWWPPPPWWWp', 'pWWWWWWWWWWp', 'pWWWWWWWWWWp', 'pppppppppppp', '............', '............'],
    code:    ['............', '.llllllllll.', '.lWWWWWWWWl.', '.lWWPWWAWWl.', '.lWPWWWWAWl.', '.lPWWWWWWAl.', '.lWPWWWWAWl.', '.lWWPWWAWWl.', '.lWWWWWWWWl.', '.llllllllll.', '...llllll...', '............'],
    flag:    ['.D..........', '.DPPPPPPP...', '.DPPPPPPPPP.', '.DPPWWPPPP..', '.DPPPPPPP...', '.DPPPPPPPPP.', '.D..........', '.D..........', '.D..........', '.D..........', 'DDD.........', '............'],
    cart:    ['............', 'aa..........', '.a..........', '.aAAAAAAAAA.', '.aAWAWAWAWA.', '.aAAAAAAAAA.', '.aAWAWAWAA..', '.aAAAAAAA...', '.aaaaaaaaa..', '............', '..DD...DD...', '..DD...DD...'],
    doc:     ['..mmmmmmm...', '..mWWWWWmm..', '..mWWWWWWm..', '..mWMMMMWm..', '..mWWWWWWm..', '..mWMMWWWm..', '..mWWWWWWm..', '..mWGGWGGm..', '..mWGGWGGm..', '..mWWGWWGm..', '..mmmmmmmm..', '............'],
    crate:   ['............', '.bbbbbbbbbb.', '.bBBBBBBBBb.', '.bBbBBBBbBb.', '.bBBbBBbBBb.', '.bBBBbbBBBb.', '.bBBBbbBBBb.', '.bBBbBBbBBb.', '.bBbBBBBbBb.', '.bBBBBBBBBb.', '.bbbbbbbbbb.', '............'],
    chat:    ['............', '.gggggggggg.', '.gGGGGGGGGg.', '.gGWWGWWWGg.', '.gGGGGGGGGg.', '.gGWWWWGWGg.', '.gGGGGGGGGg.', '.gggggggggg.', '...gGg......', '...gg.......', '...g........', '............'],
    disk:    ['............', '.llllllllll.', '.lLWWWWWDLl.', '.lLWWWWWDLl.', '.lLWWWWWWLl.', '.lLLLLLLLLl.', '.lLLLLLLLLl.', '.lLPPPPPPLl.', '.lLPWWWWPLl.', '.lLPWWWWPLl.', '.llllllllll.', '............'],
    route:   ['............', 'AA..........', 'AA..........', '.a..........', '.a...AA.....', '.aaaaAA.....', '......a.....', '......a..PP.', '......aaaPP.', '............', '............', '............']
  };
  document.querySelectorAll('[data-item]').forEach(function (el) {
    var grid = ITEMS[el.dataset.item], r = '';
    if (!grid) return;
    grid.forEach(function (row, y) {
      for (var x = 0, w; x < row.length; x += w) {
        w = 1;
        if (!INK[row[x]]) continue;
        while (row[x + w] === row[x]) w++;
        r += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1" fill="' + INK[row[x]] + '"/>';
      }
    });
    el.innerHTML = '<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">' + r + '</svg>';
  });
})();
