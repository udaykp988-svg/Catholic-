/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeastDay, Novena, ScriptureReading } from '../types';

// Traditional Liturgical Feast Days for 2026
export const FEAST_DAYS: FeastDay[] = [
  {
    id: 'f1',
    date: '06-29',
    title: 'Solemnity of Saints Peter and Paul, Apostles',
    feastLevel: 'Solemnity',
    season: 'Ordinary Time',
    color: 'red',
    description: 'Honors the martyrdom of Saint Peter, the first Pope, and Saint Paul, the teacher of nations. They are the twin pillars of the Church.',
    saintBrief: 'Peter was crucified upside down in Rome under Nero. Paul was beheaded. Together they built up Rome and the early global church.'
  },
  {
    id: 'f2',
    date: '06-24',
    title: 'Solemnity of the Nativity of Saint John the Baptist',
    feastLevel: 'Solemnity',
    season: 'Ordinary Time',
    color: 'white',
    description: ' John was chosen by God to prepare the way of the Lord. He represents the voice crying in the wilderness.',
    saintBrief: 'Born to Zachariah and Elizabeth in their old age, John is the forerunner who pointed to Jesus: "Behold, the Lamb of God."'
  },
  {
    id: 'f3',
    date: '07-16',
    title: 'Feast of Our Lady of Mount Carmel',
    feastLevel: 'Feast',
    season: 'Ordinary Time',
    color: 'white',
    description: 'Commemorates the presentation of the Brown Scapular to Saint Simon Stock. It symbolizes Our Lady\'s continuous maternal protection.',
    saintBrief: 'The Scapular is a sign of consecration to Mary, representing our devotion to Christ.'
  },
  {
    id: 'f4',
    date: '07-31',
    title: 'Memorial of Saint Ignatius of Loyola, Priest',
    feastLevel: 'Memorial',
    season: 'Ordinary Time',
    color: 'white',
    description: 'Celebrates the founder of the Society of Jesus (Jesuits) and author of the Spiritual Exercises.',
    saintBrief: 'A Spanish knight who experienced a profound conversion after being wounded in battle. Created "Ad maiorem Dei gloriam" (For the greater glory of God).'
  },
  {
    id: 'f5',
    date: '08-15',
    title: 'Solemnity of the Assumption of the Blessed Virgin Mary',
    feastLevel: 'Solemnity',
    season: 'Ordinary Time',
    color: 'white',
    description: 'Marks the taking up of Mary\'s body and soul into heavenly glory at the end of her earthly life, declared as a dogma.',
    saintBrief: 'Mary was spared from original sin and did not suffer bodily decay, being immediately united with her Divine Son.'
  },
  {
    id: 'f6',
    date: '09-29',
    title: 'Feast of Saints Michael, Gabriel, and Raphael, Archangels',
    feastLevel: 'Feast',
    season: 'Ordinary Time',
    color: 'white',
    description: 'Dedicated to the three archangels named in scripture who serve as messengers of God\'s plan and protectors against darkness.',
    saintBrief: 'Michael fights evil, Gabriel brings tidings, Raphael guides and heals.'
  },
  {
    id: 'f7',
    date: '10-01',
    title: 'Memorial of Saint Thérèse of the Child Jesus, Doctor of the Church',
    feastLevel: 'Memorial',
    season: 'Ordinary Time',
    color: 'white',
    description: 'Honors the "Little Flower" of Lisieux who proposed the "Little Way" of trust and absolute confidence in God.',
    saintBrief: 'Therese: "My vocation is love." She died at 24 but is a universal patron of missions.'
  },
  {
    id: 'f8',
    date: '12-08',
    title: 'Solemnity of the Immaculate Conception of Mary',
    feastLevel: 'Solemnity',
    season: 'Advent',
    color: 'violet',
    description: 'Patronal feast of the United States, honoring Mary\'s prevention from any stain of original sin from the moment of conception.',
    saintBrief: 'Mary is the pure vessel chosen to bear the Savior.'
  }
];

// Curated Traditional Prayers Library
export interface TraditionalPrayer {
  id: string;
  title: string;
  category: 'Rosary' | 'Marian' | 'Daily' | 'Intercession';
  text: string;
}

export const TRADITIONAL_PRAYERS: TraditionalPrayer[] = [
  {
    id: 'tp1',
    title: 'The Lord\'s Prayer (Pater Noster)',
    category: 'Daily',
    text: 'Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.'
  },
  {
    id: 'tp2',
    title: 'The Hail Mary (Ave Maria)',
    category: 'Marian',
    text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.'
  },
  {
    id: 'tp3',
    title: 'The Apostle\'s Creed (Credo)',
    category: 'Daily',
    text: 'I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.'
  },
  {
    id: 'tp4',
    title: 'Glory Be (Gloria Patri)',
    category: 'Daily',
    text: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.'
  },
  {
    id: 'tp5',
    title: 'The Fatima Prayer',
    category: 'Rosary',
    text: 'O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to heaven, especially those in most need of Thy mercy. Amen.'
  },
  {
    id: 'tp6',
    title: 'Hail, Holy Queen (Salve Regina)',
    category: 'Marian',
    text: 'Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.'
  },
  {
    id: 'tp7',
    title: 'Prayer to Saint Michael the Archangel',
    category: 'Intercession',
    text: 'Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the Heavenly Host, by the power of God, cast into hell Satan and all the evil spirits who roam throughout the world seeking the ruin of souls. Amen.'
  },
  {
    id: 'tp8',
    title: 'The Memorare',
    category: 'Marian',
    text: 'Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.'
  },
  {
    id: 'tp9',
    title: 'Anima Christi',
    category: 'Daily',
    text: 'Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O Good Jesus, hear me. Within Thy wounds hide me. Suffer me not to be separated from Thee. From the malicious enemy defend me. In the hour of my death call me, and bid me come to Thee, that with Your saints I may praise Thee, forever and ever. Amen.'
  }
];

// Curated Traditional Novenas DB (Day 1-9 Prayers included)
export const NOVENAS: Novena[] = [
  {
    id: 'nov-undoer',
    title: 'Novena to Mary, Undoer of Knots',
    description: 'Addresses the difficult knots in our life relationships, blocks of sin, and heavy knots in our heart.',
    targetSaint: 'Mary, Undoer of Knots',
    currentDay: 0,
    completedDays: [],
    prayersByDay: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      intentionBrief: `Untying the knots of ${['spiritual dryness', 'family worries', 'work struggles', 'secret habits', 'anxious thoughts', 'broken confidence', 'unforgiving hearts', 'bodily ailments', 'fear of death'][i]}.`,
      prayer: `Beloved Holy Mother, most holy Mary, you undo the knots that suffocate your children. Stretch out your merciful hands to me today. I carry this heaviest 'knot' of intention (mention here) which makes me lose peace. Grant me your comfort as I present this Day ${i + 1} of my pleading. Come, untie this knot by your powerful intercession. Lead me to the light of your Son Jesus. Amen.\n\nPray 3 Hail Marys and the Salve Regina after this.`
    }))
  },
  {
    id: 'nov-stjude',
    title: 'Novena to Saint Jude Thaddeus',
    description: 'The patron of lost causes and desperate situations. Promotes hope in times of pitch-dark trials.',
    targetSaint: 'Saint Jude',
    currentDay: 0,
    completedDays: [],
    prayersByDay: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      intentionBrief: `Pleading for hope in the ${['deepest dark', 'financial distress', 'lonely hours', 'health crises', 'family divisions', 'broken hearts', 'persecutions', 'spiritual despair', 'holy confidence'][i]}.`,
      prayer: `Glorious Apostle, Saint Jude Thaddeus, faithful servant and friend of Jesus, the Church honors and invokes you universally as the patron of difficult cases. Pray for me, I am so helpless and alone. Make use, I implore you, of that particular privilege accorded to you, to bring visible and speedy help where help is almost despaired of. Come to my assistance in this great need (mention intention). Day ${i + 1} of my trust in you. Amen.`
    }))
  },
  {
    id: 'nov-mercy',
    title: 'Divine Mercy Novena',
    description: 'Given by Jesus to Saint Faustina, pleading for the ocean of God\'s divine mercy upon the whole world.',
    targetSaint: 'Lord Jesus Christ / Divine Mercy',
    currentDay: 0,
    completedDays: [],
    prayersByDay: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      intentionBrief: `Praying for ${['all mankind & sinners', 'the souls of priests & religious', 'all devout & faithful souls', 'those who do not believe', 'souls of heretics & schismatics', 'meek & humble souls & children', 'souls who venerate My mercy', 'souls in Purgatory', 'souls who have become lukewarm'][i]}.`,
      prayer: `Today, Jesus, bring to Me the souls of those requested for Day ${i + 1} and immerse them in the ocean of My mercy. Most Merciful Jesus, from whom comes all goodness, increase Your grace in us, that we may perform worthy works of mercy, and that all who behold us may glorify the Father of Mercy in heaven. (Say the Divine Mercy Chaplet alongside this).`
    }))
  },
  {
    id: 'nov-stjoseph',
    title: 'Novena to Saint Joseph',
    description: 'Invokes Saint Joseph as Patron of Families, Workers, and a Happy Death. Perfect for vocational guidance.',
    targetSaint: 'Saint Joseph',
    currentDay: 0,
    completedDays: [],
    prayersByDay: Array.from({ length: 9 }, (_, i) => ({
      day: i + 1,
      intentionBrief: `Honor to Saint Joseph as ${['Foster-Father of Jesus', 'Chaste Spouse of Mary', 'Model of Workers', 'Pillar of Families', 'Solace of the Wretched', 'Hope of the Sick', 'Patron of the Dying', 'Terror of Demons', 'Protector of the Holy Church'][i]}.`,
      prayer: `Saint Joseph, on this Day ${i + 1} of prayer, I look to your silent faith and absolute obedience to God\'s designs. Guide my hands to perform holy work. Guard my home from discord or secular pride. Deliver my heart from fear. Most of all, obtain for me this pressing prayer (mention family/work/special intention). I trust you as Jesus trusted Your hand. Amen.`
    }))
  }
];

// 15 days of Daily Scripture Readings with full verses
export const SCRIPTURE_READINGS: ScriptureReading[] = [
  {
    id: 's1',
    day: 1,
    chapter: 'Genesis 1',
    verses: '1-10',
    text: 'In the beginning, when God created the heavens and the earth, the earth was a formless void and darkness covered the deep, while a wind from God swept over the face of the waters. Then God said, "Let there be light," and there was light...',
    reflection: 'The very first word of God is "Light". God does not desire us to sit in darkness. In our darkest crises, let us listen to the Divine Word spoken over our formless fears: "Let there be light."',
    completed: false
  },
  {
    id: 's2',
    day: 2,
    chapter: 'Psalm 23',
    verses: '1-6',
    text: 'The Lord is my shepherd; there is nothing I lack. In green pastures he makes me lie down; to still waters he leads me. He restores my soul. He guides me along right paths for the sake of his name...',
    reflection: 'Resting in God means letting go of the constant modern urge to produce and consume. The Shepherd leads us to "still waters" so our spirits can heal. Close your eyes and let Him guide you.',
    completed: false
  },
  {
    id: 's3',
    day: 3,
    chapter: 'Matthew 5',
    verses: '3-12',
    text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are they who mourn, for they will be comforted. Blessed are the meek, for they will inherit the land. Blessed are they who hunger and thirst for righteousness, for they will be satisfied...',
    reflection: 'The Beatitudes are the ultimate blueprint for Catholic holiness. They flip human standards upside down: weakness is turned to strength, poverty of spirit becomes royal abundance.',
    completed: false
  },
  {
    id: 's4',
    day: 4,
    chapter: 'John 15',
    verses: '1-8',
    text: 'I am the true vine, and my Father is the vine grower. He takes away every branch in me that does not bear fruit, and every one that does he prunes so that it bears more fruit. You are already pruned because of the word that I spoke to you...',
    reflection: 'Pruning feels like loss. It is painful to have our comfortable habits cut away or to face disappointments. Yet, God prunes us only to ensure we blossom with divine life.',
    completed: false
  },
  {
    id: 's5',
    day: 5,
    chapter: 'Romans 8',
    verses: '31-39',
    text: 'What then shall we say to this? If God is for us, who can be against us? He did not spare his own Son but handed him over for us all, how will he not also give us everything else along with him?... For I am convinced that neither death nor life... will be able to separate us from the love of God in Christ Jesus our Lord.',
    reflection: 'Nothing is stronger than God\'s covenant with us. In face of illness, isolation, or anxiety, this scripture serves as an invincible shield.',
    completed: false
  },
  {
    id: 's6',
    day: 6,
    chapter: 'Luke 1',
    verses: '26-38',
    text: 'Then the angel said to her, "Do not be afraid, Mary, for you have found favor with God. Behold, you will conceive in your womb and bear a son, and you shall name him Jesus..." Mary said, "Behold, I am the handmaid of the Lord. May it be done to me according to your word."',
    reflection: 'True greatness is found in obedience. When Mary replied with her "Fiat", she opened the historical pathway for the Divine Savior of mankind.',
    completed: false
  },
  {
    id: 's7',
    day: 7,
    chapter: 'Philippians 4',
    verses: '4-7',
    text: 'Rejoice in the Lord always. I shall say it again: rejoice! Your kindness should be known to all. The Lord is near. Have no anxiety at all, but in everything, by prayer and petition, with thanksgiving, make your requests known to God. Then the peace of God which surpasses all understanding will guard your hearts and minds in Christ Jesus.',
    reflection: 'Paul wrote this from a cold prison cell! Yet, he commands us to rejoice. True Christian joy is not an emotion about pleasant physical circumstances; it is an anchor deep in our souls.',
    completed: false
  },
  {
    id: 's8',
    day: 8,
    chapter: 'Matthew 6',
    verses: '25-34',
    text: 'Therefore I tell you, do not worry about your life, what you will eat or drink, or about your body, what you will wear... Look at the birds in the sky; they do not sow or reap, they gather nothing into barns, yet your heavenly Father feeds them. Are not you more important than they?',
    reflection: 'Worrying adds nothing to our stature. Christ gently invites us to seek first the Kingdom of God, taking one single step at a time.',
    completed: false
  },
  {
    id: 's9',
    day: 9,
    chapter: 'Isaiah 40',
    verses: '28-31',
    text: 'They that hope in the Lord will renew their strength, they will soar on eagles’ wings; they will run and not grow weary, walk and not grow faint.',
    reflection: 'Human energy is finite and quickly drains. But God\'s energy is infinite. By surrendering our dry efforts, we recharge our spirits from His divine generator.',
    completed: false
  },
  {
    id: 's10',
    day: 10,
    chapter: 'James 1',
    verses: '22-27',
    text: 'Be doers of the word and not hearers only, deluding yourselves. For if anyone is a hearer of the word and not a doer, he is like a man who looks at his own face in a mirror... but goes away and promptly forgets what he looked like.',
    reflection: 'Our faith must move from our prayer journals into our practical actions—charity, patience, giving up gossip, and serving those in dire need.',
    completed: false
  },
  {
    id: 's11',
    day: 11,
    chapter: 'Colossians 3',
    verses: '12-15',
    text: 'Put on then, as God’s chosen ones, holy and beloved, heartfelt compassion, kindness, humility, gentleness, and patience, bearing with one another and forgiving one another...',
    reflection: 'Community and family life are the ultimate training grounds for charity. Forgiving means letting go of resentments that capture our hearts.',
    completed: false
  },
  {
    id: 's12',
    day: 12,
    chapter: 'John 1',
    verses: '1-5',
    text: 'In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God. All things came to be through him, and without him nothing came to be. What came to be through him was life, and this life was the light of the human race; the light shines in the darkness, and the darkness has not overcome it.',
    reflection: 'No darkness—no personal sin, no global crisis—can ever swallow up the Light of Christ. It remains victorious, burning forever.',
    completed: false
  },
  {
    id: 's13',
    day: 13,
    chapter: 'Psalm 51',
    verses: '1-12',
    text: 'Have mercy on me, O God, in your goodness; in the greatness of your compassion wipe out my offense. Thoroughly wash me from my guilt and of my sin cleanse me...',
    reflection: 'Psalm 51 (Miserere) teaches us the beautiful path of contrition. Confession is not a courtroom of punishment but a hospital of love and revival.',
    completed: false
  },
  {
    id: 's14',
    day: 14,
    chapter: 'Ephesians 6',
    verses: '10-18',
    text: 'Draw your strength from the Lord and from his mighty power. Put on the armor of God so that you may be able to stand firm against the tactics of the devil...',
    reflection: 'We are in a structural spiritual battle. Our armor is faith, our breastplate is justice, our sword is the Holy Word of God. Do not lose courage.',
    completed: false
  },
  {
    id: 's15',
    day: 15,
    chapter: 'Revelation 21',
    verses: '1-6',
    text: 'Then I saw a new heaven and a new earth... He will wipe every tear from their eyes, and there shall be no more death or mourning, wailing or pain, for the old order has passed away. The one who sat on the throne said, "Behold, I make all things new."',
    reflection: 'The ultimate climax of our struggles is the eternal peace of the Heavenly Jerusalem. Let us press forward with our eyes fixed on this glorious finishing line.',
    completed: false
  }
];
