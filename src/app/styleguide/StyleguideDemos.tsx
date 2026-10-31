"use client";

import { toast } from "sonner";
import { GradientButton } from "@/components/brand/GradientButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StyleguideDemos() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <GradientButton>Send a message</GradientButton>
          <Button>Primary</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="destructive">Danger</Button>
          <Button onClick={() => toast.success("Saved! (sonner toast)")}>Show toast</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input, badge, avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Search a skill, e.g. exel" />
          <div className="flex items-center gap-3">
            <Badge>New</Badge>
            <Badge variant="secondary">Verified</Badge>
            <Badge variant="outline">Online</Badge>
            <Avatar>
              <AvatarFallback>RS</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs and slider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">No upcoming sessions.</TabsContent>
            <TabsContent value="past">No past sessions.</TabsContent>
          </Tabs>
          <Slider defaultValue={[3]} min={1} max={5} step={1} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dialog, sheet, skeleton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>It&apos;s a match!</DialogTitle>
                  <DialogDescription>Excel ⇄ English</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Mode, swap-only and more.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
