import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { Program } from "@/services/programs.service";

interface ProgramCardProps {
    program: Program;
    action?: React.ReactNode;
}

export function ProgramCard({ program, action }: ProgramCardProps) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl line-clamp-2">{program.name}</CardTitle>
                    <Badge variant={program.status === 'open' ? 'default' : 'secondary'}>
                        {program.status}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                    {program.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                        {format(new Date(program.startDate), 'PPP')} - {format(new Date(program.endDate), 'PPP')}
                    </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    <span>{program.maxParticipants} participants max</span>
                </div>
            </CardContent>
            {action && (
                <CardFooter>
                    {action}
                </CardFooter>
            )}
        </Card>
    );
}
