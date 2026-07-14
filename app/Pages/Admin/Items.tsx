"use client";

import React, { useState, useMemo, useEffect } from "react";
import Metrics from "../../components/Metrics";
import Filters, { RarityType } from "../../components/Filters";
import ItemTable, { GachaItem } from "../../components/ItemTable";
import ItemModal from "../../components/ItemModal";
import { baseUrl, fileToBase64, sendRequest, socketUrl } from "@/app/static/core_function";
import { useAuth } from "@/app/context/AuthContext";

// const INITIAL_ITEMS: GachaItem[] = [
//   {
//     id: "item-1",
//     event_id: String(1),
//     item_name: "Solaris Zenith Edge",
//     description:
//       "Manage global item pool, manipulate rarity weights, and monitor drop rates.",
//     rarity: "Legendaris",
//     drop_rate: 0.5,
//     image: "/solaris_zenith_edge.png",
//   },
//   {
//     id: "item-2",
//     event_id: String(1),
//     item_name: "Voidshard Dagger",
//     description:
//       "Infused with cosmic purple shards that phase through physical matter.",
//     rarity: "Langka",
//     drop_rate: 15.0,
//     image: "/voidshard_dagger.png",
//   },
//   {
//     id: "item-3",
//     event_id: String(2),
//     item_name: "Ironclad Guard",
//     description:
//       "Heavy alloy armor plated with titanium weave for impenetrable defense.",
//     rarity: "Biasa",
//     drop_rate: 84.5,
//     image: "/ironclad_guard.png",
//   },
//   {
//     id: "item-4",
//     event_id: String(2),
//     item_name: "Astral Wing-Set",
//     description: "Feathered wings crystallized with nebulous solar dust.",
//     rarity: "Legendaris",
//     drop_rate: 0.0,
//     image: "/astral_wing_set.png",
//   },
// ];

interface ItemsPageProps {
  searchQuery: string;
}

export default function ItemsPage({ searchQuery }: ItemsPageProps) {
  const [items, setItems] = useState<GachaItem[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<RarityType>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const {token} = useAuth()
  const [listEvent,setListEvent] = useState<any[]>([])
  // const [payload,setPayload] = useState<any>({

  // })

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GachaItem | null>(null);

  const totalDropRate = useMemo(
    () => items.reduce((sum, item) => sum + item.drop_rate, 0),
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.item_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRarity =
        selectedRarity === "All" || item.rarity === selectedRarity;
      return matchesSearch && matchesRarity;
    });
  }, [items, searchQuery, selectedRarity]);

  const rarityCounts = useMemo(() => {
    const counts = { All: items.length, Legendaris: 0, Langka: 0, Biasa: 0 };
    items.forEach((item) => {
      if (item.rarity in counts) {
        counts[item.rarity as "Legendaris" | "Langka" | "Biasa"] += 1;
      }
    });
    return counts;
  }, [items]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset to page 1 whenever the (lifted) search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleOpenSummonModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GachaItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this item from the registry?")) {
      try{
        const result = await sendRequest(`${baseUrl}/items/${id}`,"DELETE",undefined,"items",{token:true},token??undefined)
        if((result as any).result){
          fetchItems()
        }
      }catch(err){
        console.error("delete Error :",err)
      }
    }
  };

  const fetchEvent =async()=>{
      try{
        const req = await sendRequest(`${baseUrl}/Events`,"GET",undefined,"events",{token:true},token??undefined)
        const res = req as any
        setListEvent(
          res.data.map((event: any) => ({
            id: event.id,
            label: event.event_name,
          }))
        );
      }catch(err){
        console.error(err)
      }
  }
  
  const fetchItems = async()=>{
    try{
      const response = await sendRequest(`${baseUrl}/items`,"GET",undefined,"items",{token:true},token??undefined)
      if((response as any).result){
          const data = (response as any).data
          setItems(
            data.map((item: any) => ({
              id: String(item.id),
              event_id: String(item.event_id),
              event_name:item.event_name,
              item_name: item.item_name,
              description: item.description,
              rarity: item.rarity,
              drop_rate: parseFloat(item.drop_rate),
              image: `${socketUrl}/src/assets/items/${item.images}`, // 👈 key renamed to match interface
            }))
          );
      }
    }catch(err){
      console.error("fetch Items : ",err)
    }
  }


  const handleModalSubmit = async (
  itemData: Omit<GachaItem, "id" | "image">,
  imageFile: File | null,
) => {
  let imagesBase64: string = "";
  if (imageFile) {
    const previewUrl = URL.createObjectURL(imageFile);
    imagesBase64 = await fileToBase64(previewUrl);
  }

  if (editingItem) {
    const updatePayload: any = {
      id: editingItem.id,
      ...itemData,
    };
    if (imagesBase64) {
      updatePayload.images = imagesBase64; // only send if a new image was picked
    }

    try {
      const res = (await sendRequest(`${baseUrl}/items`,"PATCH",updatePayload,"items",{ token: true },token ?? undefined,)) as any;
      if (res.result) {
        fetchItems(); // re-pull from DB so image URL etc. stays in sync
      }
    } catch (err) {
      console.error("update Item :", err);
    }
  } else {
    const newItem = {
      ...itemData,
      images: imagesBase64,
    };
    await handleSubmit(newItem);
    fetchItems(); // 👈 also missing today — insert doesn't refresh the list either
  }

  setIsModalOpen(false);
};
  const handleSubmit = async(newItem:any)=>{
    try{
      const res = await sendRequest(`${baseUrl}/Items`,"POST",newItem,"items",{token:true},token??undefined)
      if((res as any).result){
          fetchItems()
      }
    }catch(err){
      console.error(err)
    }
  }
  const handleRarityChange = (rarity: RarityType) => {
    setSelectedRarity(rarity);
    setCurrentPage(1);
  };

  useEffect(()=>{
    fetchEvent()
    fetchItems()
  },[])

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">
          Item Database
        </h2>
        <p className="text-sm md:text-base text-muted/90 max-w-2xl leading-relaxed">
          Manage global item pool, manipulate rarity weights, and monitor
          drop rate across all dimensions.
        </p>
      </div>

      <Metrics
        totalItems={items.length}
        totalDropRate={totalDropRate}
        onSummonClick={handleOpenSummonModal}
        data = {items}
      />

      <Filters
        selectedRarity={selectedRarity}
        onRarityChange={handleRarityChange}
        counts={rarityCounts}
      />

      <div className="w-full">
        <ItemTable
          items={paginatedItems}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteItem}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalCount={filteredItems.length}
        />
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        currentTotalDropRate={totalDropRate}
        ListEvents ={listEvent}
      />
    </div>
  );
}