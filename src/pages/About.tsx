import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const About = () => {
  const teamMembers = [
    { name: 'Kian Brylle Enriquez', role: 'Project Manager', image: 'https://i.imgur.com/C8MgI3T.png', quote: 'Leadership is the art of turning vision into reality.', instagram: 'https://www.instagram.com/kheyanxz/' },
    { name: 'Mark Emman Lopez', role: 'Web Developer', image: 'https://i.imgur.com/ACD5zeO.png', quote: 'Code is poetry written in logic.', youtube: 'https://youtu.be/Rht8rS4cR1s?si=OseiUwERdcwZuPH3', instagram: 'https://www.instagram.com/m.emman27/' },
    { name: 'Rihana Khan', role: 'Content Specialist', image: 'https://i.imgur.com/mlICeOn.png', quote: 'Words have the power to inspire and transform.', instagram: 'https://www.instagram.com/riii15kmf/' },
    { name: 'Samuel De Guzman', role: 'Content Specialist', image: 'https://i.imgur.com/WPzEwSn.png', quote: 'Every story deserves to be told beautifully.', instagram: 'https://www.instagram.com/l3nwas/' },
    { name: 'Lian Fianca Vinluan', role: 'Web Designer', image: 'https://i.imgur.com/uJK9o8t.png', quote: 'Design is where art meets functionality.', instagram: 'https://www.instagram.com/eiyawn/' },
    { name: 'John Lawrence Kenneth Mandario', role: 'Web Designer', image: 'https://i.imgur.com/WVTOJ32.png', quote: 'Beauty lies in the details.', instagram: 'https://www.instagram.com/crwlmandario/' },
    { name: 'Joshua Ladislao', role: 'Web Strategist', image: 'https://i.imgur.com/WoWuB7X.png', quote: 'Strategy turns dreams into actionable plans.', instagram: 'https://www.instagram.com/jladz.ggs/' },
    { name: 'Ashley Nicole Baladad', role: 'Inbound Marketer', image: 'https://i.imgur.com/YllSgO2.png', quote: 'Marketing is the bridge between value and visibility.', instagram: 'https://www.instagram.com/asherrishh/' },
    { name: 'Martin Ryan Malintad', role: 'Inbound Marketer', image: 'https://i.imgur.com/gxCpADl.png', quote: 'Attract, engage, delight – that\'s the inbound way.', instagram: 'https://www.instagram.com/m4yd_13/' },
    { name: 'Princes Fernandez', role: 'Inbound Marketer', image: 'https://i.imgur.com/EYwKthV.png', quote: 'Great content creates lasting connections.', instagram: 'https://www.facebook.com/princess.fernandez.75286100' },
    { name: 'Joerwil Jedric Bandong', role: 'Inbound Marketer', image: 'https://i.imgur.com/MhkaDtm.png', quote: 'Innovation is the key to standing out.', instagram: 'https://www.instagram.com/joerbndg_/' },
  ];

  const handleMemberClick = (member: any) => {
    if (member.name === 'Mark Emman Lopez' && member.youtube) {
      // Open YouTube first, then IG after 3 seconds
      window.open(member.youtube, '_blank');
      setTimeout(() => window.open(member.instagram, '_blank'), 3000);
    } else {
      window.open(member.instagram, '_blank');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container text-center max-w-3xl">
          <h1 className="text-5xl font-display font-bold mb-6">Our Story</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Aurevia started with a simple dream — to create jewelry that captures the grace, elegance, and timeless beauty of royalty. What began as a passion for design and craftsmanship soon turned into a mission to bring a touch of royalty into everyday life. Each Aurevia piece is carefully crafted to reflect style and individuality, blending classic charm with a modern touch. We believe that everyone deserves to feel confident, beautiful, and a little royal — and that’s exactly what Aurevia is all about.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Meet Our Team</h2>
          <Carousel
            className="w-full max-w-5xl mx-auto"
            opts={{
              loop: true,
              align: 'start',
            }}
          >
            <CarouselContent>
              {teamMembers.map((member, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <div
                      className="relative aspect-square gold-border rounded-lg overflow-hidden mb-4 cursor-pointer group"
                      onClick={() => handleMemberClick(member)}
                    >
                      {/* Image */}
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Quote overlay on hover */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4 text-center">
                        <p className="text-gold font-medium italic text-sm md:text-base">
                          “{member.quote}”
                        </p>
                      </div>
                    </div>

                    <h3 className="font-display font-semibold text-lg text-center">{member.name}</h3>
                    <p className="text-muted-foreground text-sm text-center">{member.role}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-4 bg-accent text-accent-foreground hover:bg-accent/90 border-accent" />
            <CarouselNext className="right-4 bg-accent text-accent-foreground hover:bg-accent/90 border-accent" />
          </Carousel>
        </div>
      </section>
    </div>
  );
};

export default About;
